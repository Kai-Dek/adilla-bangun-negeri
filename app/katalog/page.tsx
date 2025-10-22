"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";

export default function KatalogPage() {
  type Book = { id: string; title: string; author: string; year?: number; category?: string; coverImage?: string };
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [selectedYear, setSelectedYear] = useState("Semua Tahun");
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "Semua Kategori") {
        params.append("category", selectedCategory);
      }
      if (selectedYear !== "Semua Tahun") {
        params.append("year", selectedYear);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/books?${params}`);
      const data: Book[] = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedYear, searchQuery]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = () => {
    fetchBooks();
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("Semua Kategori");
    setSelectedYear("Semua Tahun");
  };

  // Extract unique categories and years from books
  const categories = [
    "Semua Kategori",
    ...Array.from(
      new Set(books.map((book) => book.category).filter(Boolean))
    ),
  ];

  const years = [
    "Semua Tahun",
    ...Array.from(
      new Set(books.map((book) => book.year).filter(Boolean))
    ).sort((a, b) => Number(b) - Number(a)),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-[#0a2540] text-white py-12 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Katalog Buku</h1>
          <p className="text-xl text-gray-300">
            Jelajahi koleksi lengkap buku akademik berkualitas dari Adilla
            Bangun Negeri
          </p>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-6">
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pencarian</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari judul, penulis, atau ISBN...
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari judul, penulis, atau ISBN..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-2.5"
                  >
                    <Search className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-gray-600">
              Menampilkan <span className="font-semibold">{books.length}</span>{" "}
              buku
              {searchQuery && ` untuk "${searchQuery}"`}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tidak ada buku ditemukan
              </h3>
              <p className="text-gray-600 mb-4">
                Coba ubah kriteria pencarian atau filter Anda
              </p>
              <button
                onClick={handleReset}
                className="bg-[#f97316] text-white px-6 py-2 rounded-md hover:bg-[#ea580c] transition"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
