import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const yearParam = searchParams.get("year") || "";
    const withMeta = searchParams.get("withMeta") === "true";

    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { isbn: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (yearParam && yearParam !== "Semua Tahun") {
      const parsedYear = parseInt(yearParam);
      if (!Number.isNaN(parsedYear)) {
        where.year = parsedYear;
      }
    }

    const total = await prisma.book.count({ where });

    const books = await prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (!withMeta) {
      return NextResponse.json(books);
    }

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      books,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// POST - Tambah buku baru (FIXED)
export async function POST(request: NextRequest) {
  try {
    // PERBAIKAN: Tambahkan authOptions sebagai parameter
    const session = await getServerSession(authOptions);

    console.log("Session:", session); // Debug log

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      author,
      publisher,
      year,
      isbn,
      description,
      category,
      coverImage,
    } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        publisher,
        year: year ? parseInt(year) : null,
        isbn,
        description,
        category,
        coverImage,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating book:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string" &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "ISBN already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
