"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, TrendingUp, Plus, Eye, Trash2 } from "lucide-react";
import type { Session } from "next-auth";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number;
}

interface Stats {
  totalBooks: number;
  totalUsers: number;
  totalBookmarks: number;
  mostPopularBook: {
    id: string;
    title: string;
    bookmarkCount: number;
  } | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (!data.user || data.user.role !== "ADMIN") {
          router.push("/login");
          return;
        }

        setSession(data);
      } catch (error) {
        console.error("Error checking session:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch books and stats in parallel
        const [booksRes, statsRes] = await Promise.all([
          fetch("/api/books"),
          fetch("/api/stats")
        ]);
        
        const booksData = await booksRes.json();
        const statsData = await statsRes.json();
        
        setBooks(booksData.slice(0, 10));
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBooks(books.filter((book) => book.id !== id));
        alert("Buku berhasil dihapus!");
      } else {
        alert("Gagal menghapus buku");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Terjadi kesalahan saat menghapus buku");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Buku",
      value: stats?.totalBooks?.toLocaleString() || "0",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    { 
      title: "Total User", 
      value: stats?.totalUsers?.toLocaleString() || "0", 
      icon: Users, 
      color: "bg-green-500" 
    },
    {
      title: "Total Bookmark",
      value: stats?.totalBookmarks?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Selamat datang kembali, {session?.user?.name}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6"
          >
            <div className="flex items-center">
              <div className={`rounded-lg ${stat.color} p-2 sm:p-3`}>
                <stat.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs font-medium text-gray-500 sm:text-sm">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <button
          onClick={() => router.push("/admin/dashboard/books/add")}
          className="group rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg sm:p-8"
        >
          <Plus className="mb-3 h-8 w-8 text-gray-400 transition-colors group-hover:text-blue-500 sm:mb-4 sm:h-10 sm:w-10" />
          <h3 className="mb-1 text-base font-semibold text-gray-900 sm:mb-2 sm:text-lg">
            Tambah Buku Baru
          </h3>
          <p className="text-xs text-gray-500 sm:text-sm">
            Tambahkan koleksi buku ke database
          </p>
        </button>

        <button
          onClick={() => router.push("/admin/dashboard/users")}
          className="group rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-left transition-all hover:border-green-500 hover:shadow-lg sm:p-8"
        >
          <Users className="mb-3 h-8 w-8 text-gray-400 transition-colors group-hover:text-green-500 sm:mb-4 sm:h-10 sm:w-10" />
          <h3 className="mb-1 text-base font-semibold text-gray-900 sm:mb-2 sm:text-lg">
            Kelola User
          </h3>
          <p className="text-xs text-gray-500 sm:text-sm">
            Lihat dan kelola data pengguna
          </p>
        </button>

        <button
          onClick={() => router.push("/admin/dashboard/reports")}
          className="group rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-left transition-all hover:border-purple-500 hover:shadow-lg sm:col-span-2 sm:p-8 lg:col-span-1"
        >
          <TrendingUp className="mb-3 h-8 w-8 text-gray-400 transition-colors group-hover:text-purple-500 sm:mb-4 sm:h-10 sm:w-10" />
          <h3 className="mb-1 text-base font-semibold text-gray-900 sm:mb-2 sm:text-lg">
            Laporan
          </h3>
          <p className="text-xs text-gray-500 sm:text-sm">
            Lihat statistik dan laporan
          </p>
        </button>
      </div>

      {/* Recent Books Section */}
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Buku Terbaru
          </h2>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            10 buku yang baru ditambahkan
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-semibold text-gray-700">
                  Judul Buku
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-gray-700">
                  Penulis
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-gray-700">
                  Kategori
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-gray-700">
                  Tahun
                </th>
                <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="mb-1 text-base font-medium text-gray-900">
                      Belum ada buku
                    </p>
                    <p className="text-sm text-gray-500">
                      Mulai tambahkan buku pertama Anda
                    </p>
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="border-b border-gray-100">
                    <td className="py-4 text-sm text-gray-900">{book.title}</td>
                    <td className="py-4 text-sm text-gray-600">
                      {book.author}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {book.category}
                    </td>
                    <td className="py-4 text-sm text-gray-600">{book.year}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/books/${book.id}`)}
                        className="mr-2 rounded p-2 text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="space-y-4 md:hidden">
          {books.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="mb-1 text-base font-medium text-gray-900">
                Belum ada buku
              </p>
              <p className="text-sm text-gray-500">
                Mulai tambahkan buku pertama Anda
              </p>
            </div>
          ) : (
            books.map((book) => (
              <div
                key={book.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{book.author}</p>
                </div>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <span className="font-medium">Kategori:</span>{" "}
                    {book.category}
                  </span>
                  <span className="text-gray-500">
                    <span className="font-medium">Tahun:</span> {book.year}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/books/${book.id}`)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    Lihat
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
