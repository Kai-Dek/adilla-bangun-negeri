import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// POST - Tambah bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        bookId: bookId
      }
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: "Book already bookmarked" },
        { status: 400 }
      );
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        bookId: bookId
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Book bookmarked successfully",
      bookmark
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error creating bookmark:", error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Book already bookmarked" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to bookmark book" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus bookmark
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    // Delete bookmark
    await prisma.bookmark.deleteMany({
      where: {
        userId: session.user.id,
        bookId: bookId
      }
    });

    return NextResponse.json({
      message: "Bookmark removed successfully"
    });

  } catch (error: unknown) {
    console.error("Error removing bookmark:", error);
    
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}

// GET - Get user bookmarks or check specific bookmark status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // If bookId is provided, check if user has bookmarked this specific book
    if (bookId) {
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId: session.user.id,
          bookId: bookId
        }
      });

      return NextResponse.json({ 
        isBookmarked: !!bookmark 
      });
    }

    // Otherwise, get all user bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            category: true,
            year: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ bookmarks });

  } catch (error: unknown) {
    console.error("Error fetching bookmarks:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
