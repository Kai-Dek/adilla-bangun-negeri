import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to reliably obtain userId and role even if token.id was missing from legacy sessions
async function getAuthUser(session: { user?: { id?: string; email?: string | null; role?: string } } | null) {
  if (!session?.user?.email) return null;

  if (session.user.id && session.user.role) {
    return { id: session.user.id, role: session.user.role };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  return dbUser;
}

// POST - Tambah bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authUser = await getAuthUser(session);

    if (!authUser) {
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
      where: { id: bookId },
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
        userId: authUser.id,
        bookId: bookId,
      },
    });

    if (existingBookmark) {
      return NextResponse.json({
        message: "Book already bookmarked",
        isBookmarked: true,
        bookmark: existingBookmark,
      }, { status: 200 });
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: authUser.id,
        bookId: bookId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Book bookmarked successfully",
      isBookmarked: true,
      bookmark,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error creating bookmark:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({
        message: "Book already bookmarked",
        isBookmarked: true,
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Failed to bookmark book" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus bookmark (User untuk bukunya sendiri, atau Admin untuk bookmark apa saja)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authUser = await getAuthUser(session);

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId, bookmarkId } = body;

    if (!bookId && !bookmarkId) {
      return NextResponse.json(
        { error: "Book ID or Bookmark ID is required" },
        { status: 400 }
      );
    }

    // Admin dapat menghapus bookmark berdasarkan bookmarkId
    if (bookmarkId) {
      if (authUser.role === "ADMIN") {
        await prisma.bookmark.delete({
          where: { id: bookmarkId },
        });
      } else {
        await prisma.bookmark.deleteMany({
          where: {
            id: bookmarkId,
            userId: authUser.id,
          },
        });
      }

      return NextResponse.json({
        message: "Bookmark removed successfully",
        isBookmarked: false,
      });
    }

    // Hapus bookmark berdasarkan bookId untuk user saat ini
    if (bookId) {
      await prisma.bookmark.deleteMany({
        where: {
          userId: authUser.id,
          bookId: bookId,
        },
      });

      return NextResponse.json({
        message: "Bookmark removed successfully",
        isBookmarked: false,
      });
    }

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
    const authUser = await getAuthUser(session);

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first", isBookmarked: false },
        { status: 401 }
      );
    }

    // If bookId is provided, check if user has bookmarked this specific book
    if (bookId) {
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId: authUser.id,
          bookId: bookId,
        },
      });

      return NextResponse.json(
        { isBookmarked: !!bookmark },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // Otherwise, get all user bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: authUser.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            category: true,
            year: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { bookmarks },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );

  } catch (error: unknown) {
    console.error("Error fetching bookmarks:", error);

    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

