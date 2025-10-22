"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  Building2,
  Hash,
  Tag,
  Pencil,
  Trash2,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  year: number | null;
  isbn: string | null;
  description: string | null;
  category: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  bookmarks: {
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
}

export default function BookDetail() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${params.id}`);

        if (res.ok) {
          const data = await res.json();
          setBook(data);
        } else {
          alert("Buku tidak ditemukan");
          router.push("/admin/dashboard/books");
        }
      } catch (error) {
        console.error("Error fetching book:", error);
        alert("Terjadi kesalahan saat memuat data buku");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBook();
    }
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;

    try {
      const res = await fetch(`/api/books/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Buku berhasil dihapus!");
        router.push("/admin/dashboard/books");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus buku");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Terjadi kesalahan saat menghapus buku");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard/books"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Kelola Buku
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Detail Buku
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Informasi lengkap tentang buku ini
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                href={`/admin/dashboard/books/${book.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Cover Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg bg-white p-6 shadow-sm">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  width={300}
                  height={420}
                  className="mx-auto w-full rounded-lg object-cover shadow-md"
                  priority
                />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-gray-100">
                  <BookOpen className="h-20 w-20 text-gray-300" />
                </div>
              )}

              {book.category && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    <Tag className="h-4 w-4" />
                    {book.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Book Information */}
          <div className="space-y-6 lg:col-span-2">
            {/* Main Information Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                {book.title}
              </h2>
              <p className="mb-4 text-lg text-gray-600">oleh {book.author}</p>

              {book.description && (
                <div className="mb-6 border-t border-gray-100 pt-4">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Deskripsi
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Book Details Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Publisher */}
                {book.publisher && (
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Publisher
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {book.publisher}
                      </p>
                    </div>
                  </div>
                )}

                {/* Year */}
                {book.year && (
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                    <div className="rounded-full bg-orange-100 p-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Tahun Terbit
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {book.year}
                      </p>
                    </div>
                  </div>
                )}

                {/* ISBN */}
                {book.isbn && (
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 sm:col-span-2">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Hash className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">ISBN</p>
                      <p className="mt-1 text-sm font-mono font-semibold text-gray-900">
                        {book.isbn}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bookmarks Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  User yang Bookmark ({book.bookmarks.length})
                </h3>
              </div>

              {book.bookmarks.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada user yang mem-bookmark buku ini
                </p>
              ) : (
                <div className="space-y-2">
                  {book.bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {bookmark.user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bookmark.user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Metadata</h3>

              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Dibuat</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(book.createdAt)}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Terakhir Diupdate</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(book.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
