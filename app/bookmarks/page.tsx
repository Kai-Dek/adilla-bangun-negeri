"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import Footer from "@/components/Footer";
import {
  Bookmark,
  BookOpen,
  Search,
  Trash2,
  LogIn,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface BookmarkItem {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string | null;
    category: string | null;
    year: number | null;
  };
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookmarks", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchBookmarks();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [session?.user, status, fetchBookmarks]);

  // Remove bookmark directly from this page
  const handleRemoveBookmark = async (
    e: React.MouseEvent,
    bookId: string,
    bookmarkId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Hapus buku ini dari daftar bookmark Anda?")) return;

    setDeletingId(bookmarkId);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (res.ok) {
        setBookmarks((prev) => prev.filter((item) => item.id !== bookmarkId));
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus bookmark");
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      alert("Terjadi kesalahan saat menghapus bookmark");
    } finally {
      setDeletingId(null);
    }
  };

  // Extract unique categories from bookmarked books
  const categories = useMemo(() => {
    const set = new Set(
      bookmarks.map((b) => b.book?.category).filter(Boolean) as string[]
    );
    return ["Semua Kategori", ...Array.from(set)];
  }, [bookmarks]);

  // Filter bookmarks by search and category
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((item) => {
      const book = item.book;
      if (!book) return false;

      const matchesSearch =
        !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Semua Kategori" ||
        book.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [bookmarks, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header Banner - Sama dengan tema Katalog & Detail Buku */}
      <div className="bg-[#0a2540] text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#f97316] p-2.5 rounded-xl shadow-md">
                  <Bookmark className="w-6 h-6 text-white fill-current" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Buku yang Disimpan
                </h1>
              </div>
              <p className="text-gray-300 text-base md:text-lg max-w-2xl">
                Koleksi buku favorit dan referensi pilihan yang telah Anda
                tandai untuk dibaca dan dipelajari kembali.
              </p>
            </div>

            {session && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-5 py-3 rounded-xl flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-300 font-medium">
                    Total Tersimpan
                  </p>
                  <p className="text-2xl font-bold text-[#f97316]">
                    {bookmarks.length}{" "}
                    <span className="text-sm text-gray-200 font-normal">
                      Buku
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8 px-6">
        <div className="container mx-auto">
          {status === "loading" || isLoading ? (
            // Loading Skeletons
            <div>
              <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md p-4 animate-pulse space-y-4"
                  >
                    <div className="aspect-[3/4] bg-gray-200 rounded-md" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ) : !session ? (
            // Belum Login State
            <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 text-[#f97316] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <LogIn className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Login untuk Melihat Bookmark Anda
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Anda perlu masuk ke akun Anda untuk melihat, mengelola, dan
                menyimpan koleksi buku favorit Anda.
              </p>
              <Link
                href="/login?callbackUrl=/bookmarks"
                className="inline-flex items-center justify-center gap-2 bg-[#f97316] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#ea580c] transition shadow-md hover:shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                Login Sekarang
              </Link>
            </div>
          ) : bookmarks.length === 0 ? (
            // Kosong State (Belum ada bookmark)
            <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">
              <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Bookmark className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Belum Ada Buku yang Disimpan
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Daftar bookmark Anda masih kosong. Jelajahi katalog buku kami dan
                klik tombol <strong>Bookmark</strong> pada buku yang menarik
                perhatian Anda.
              </p>
              <Link
                href="/katalog"
                className="inline-flex items-center justify-center gap-2 bg-[#f97316] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#ea580c] transition shadow-md hover:shadow-lg"
              >
                <BookOpen className="w-5 h-5" />
                Jelajahi Katalog Buku
              </Link>
            </div>
          ) : (
            // Ada Bookmark
            <div>
              {/* Filter & Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-5 mb-8">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari dalam bookmark (judul atau penulis)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  {categories.length > 1 && (
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Status info */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Menampilkan{" "}
                    <strong className="text-gray-800">
                      {filteredBookmarks.length}
                    </strong>{" "}
                    dari {bookmarks.length} buku disimpan
                  </span>
                  {(searchQuery || selectedCategory !== "Semua Kategori") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("Semua Kategori");
                      }}
                      className="text-[#f97316] hover:underline font-medium"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Buku */}
              {filteredBookmarks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                  <p className="text-gray-600 mb-3">
                    Tidak ada buku yang cocok dengan kriteria pencarian Anda.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Semua Kategori");
                    }}
                    className="text-[#f97316] font-semibold hover:underline"
                  >
                    Tampilkan Semua Buku Disimpan
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredBookmarks.map((item) => (
                    <div key={item.id} className="relative group">
                      <BookCard
                        id={item.book.id}
                        title={item.book.title}
                        author={item.book.author}
                        year={item.book.year}
                        category={item.book.category}
                        coverImage={item.book.coverImage}
                      />
                      {/* Floating Quick Remove Button */}
                      <button
                        onClick={(e) =>
                          handleRemoveBookmark(e, item.book.id, item.id)
                        }
                        disabled={deletingId === item.id}
                        className="absolute top-2 left-2 z-10 bg-white/95 hover:bg-red-50 text-gray-500 hover:text-red-600 p-2 rounded-full shadow-md border border-gray-200 transition-all duration-200 opacity-90 group-hover:opacity-100 group-hover:scale-105"
                        title="Hapus dari bookmark"
                        aria-label="Hapus dari bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
