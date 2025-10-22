"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
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
  category: string | null;
  coverImage: string | null;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BooksManagement() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <BooksContent />
    </Suspense>
  );
}

function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/books/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);

      const page = searchParams.get("page") || "1";
      const limit = searchParams.get("limit") || "10";

      const params = new URLSearchParams({
        page,
        limit,
        search,
        category,
        withMeta: "true",
      });

      try {
        const res = await fetch(`/api/books?${params.toString()}`);
        const data = await res.json();

        // Mendukung response lama (array) dan baru (objek dengan meta)
        if (Array.isArray(data)) {
          setBooks(data);
          setPagination((prev) => ({ ...prev, page: parseInt(page), limit: parseInt(limit), total: data.length, totalPages: 1 }));
        } else {
          setBooks(data.books || []);
          setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchParams, search, category]);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Buku berhasil dihapus!");
        // Refresh data
        const params = new URLSearchParams(searchParams.toString());
        router.push(`?${params.toString()}`);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus buku");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Terjadi kesalahan saat menghapus buku");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Kelola Buku
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola koleksi buku publisher Anda
            </p>
          </div>
          <Link
            href="/admin/dashboard/books/add"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-6"
          >
            <Plus className="h-5 w-5" />
            Tambah Buku
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Search */}
            <div className="md:col-span-7">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari judul, penulis, atau ISBN..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-5">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Books Table/Grid */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Belum ada buku
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Mulai tambahkan buku pertama Anda ke dalam database
            </p>
            <Link
              href="/admin/dashboard/books/add"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Tambah Buku Sekarang
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-lg bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Buku
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Penulis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Tahun
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        ISBN
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {books.map((book) => (
                      <tr
                        key={book.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {book.coverImage ? (
                              <Image
                                src={book.coverImage}
                                alt={book.title}
                                width={40}
                                height={56}
                                className="h-14 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-10 items-center justify-center rounded bg-gray-200">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {book.title}
                              </div>
                              {book.publisher && (
                                <div className="text-sm text-gray-500">
                                  {book.publisher}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {book.author}
                        </td>
                        <td className="px-6 py-4">
                          {book.category ? (
                            <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              {book.category}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {book.year || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {book.isbn || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/dashboard/books/${book.id}`}
                              className="rounded p-2 text-blue-600 transition-colors hover:bg-blue-50"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/dashboard/books/${book.id}/edit`}
                              className="rounded p-2 text-green-600 transition-colors hover:bg-green-50"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(book.id)}
                              className="rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="rounded-lg bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex gap-3">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        width={60}
                        height={84}
                        className="h-21 w-15 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-21 w-15 items-center justify-center rounded bg-gray-200">
                        <BookOpen className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {book.title}
                      </h3>
                      <p className="mb-2 text-sm text-gray-600">
                        {book.author}
                      </p>
                      {book.category && (
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {book.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
                    {book.publisher && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Publisher:</span>
                        <span className="font-medium text-gray-900">
                          {book.publisher}
                        </span>
                      </div>
                    )}
                    {book.year && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tahun:</span>
                        <span className="font-medium text-gray-900">
                          {book.year}
                        </span>
                      </div>
                    )}
                    {book.isbn && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">ISBN:</span>
                        <span className="font-medium text-gray-900">
                          {book.isbn}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/admin/dashboard/books/${book.id}`}
                      className="flex items-center justify-center gap-1 rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                      Lihat
                    </Link>
                    <Link
                      href={`/admin/dashboard/books/${book.id}/edit`}
                      className="flex items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="flex items-center justify-center gap-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row">
                <div className="text-sm text-gray-700">
                  Menampilkan{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  dari <span className="font-medium">{pagination.total}</span>{" "}
                  buku
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="rounded-lg border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        const current = pagination.page;
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= current - 1 && page <= current + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          )}
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                              page === pagination.page
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-lg border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
