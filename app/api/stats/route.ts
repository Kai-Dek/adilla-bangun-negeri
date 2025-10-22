import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    // Get total counts
    const [totalBooks, totalUsers, totalBookmarks] = await Promise.all([
      prisma.book.count(),
      prisma.user.count(),
      prisma.bookmark.count(),
    ]);

    // Get most popular book (most bookmarked)
    const mostPopularBook = await prisma.book.findFirst({
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy: {
        bookmarks: {
          _count: 'desc',
        },
      },
    });

    const stats = {
      totalBooks,
      totalUsers,
      totalBookmarks,
      mostPopularBook: mostPopularBook ? {
        id: mostPopularBook.id,
        title: mostPopularBook.title,
        bookmarkCount: mostPopularBook._count.bookmarks,
      } : null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
