"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import Footer from "@/components/Footer";
import {
  BookOpen,
  User,
  Hash,
  Search,
  TrendingUp,
  X,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

export default function PencarianPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <PencarianContent />
    </Suspense>
  );
}

function PencarianContent() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [searchField, setSearchField] = useState("all");
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  type SearchBook = { id: string; title: string; author: string; year?: number; category?: string; coverImage?: string; createdAt: string };
  const [searchResults, setSearchResults] = useState<SearchBook[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/books");
      const data: SearchBook[] = await response.json();

      const uniqueCategories = Array.from(
        new Set(data.map((book) => book.category).filter(Boolean))
      ) as string[];

      const uniqueYears = Array.from(
        new Set(data.map((book) => book.year).filter(Boolean))
      ).sort((a, b) => Number(b) - Number(a)) as number[];

      setCategories(uniqueCategories);
      setYears(uniqueYears);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();

      // Add search parameter based on field
      if (keyword.trim()) {
        params.append("search", keyword);
        if (searchField !== "all") {
          params.append("field", searchField);
        }
      }

      if (category !== "all") {
        params.append("category", category);
      }

      if (year !== "all") {
        params.append("year", year);
      }

      const response = await fetch(`/api/books?${params}`);
      let data: SearchBook[] = await response.json();

      // Client-side sorting
      if (sortBy === "newest") {
        data = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "oldest") {
        data = data.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (sortBy === "title") {
        data = data.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === "author") {
        data = data.sort((a, b) => a.author.localeCompare(b.author));
      }

      setSearchResults(data);
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, searchField, category, year, sortBy]);

  useEffect(() => {
    fetchCategories();
    if (searchParams.get("q")) {
      handleSearch();
    }
  }, [fetchCategories, handleSearch, searchParams]);

  const handleReset = () => {
    setKeyword("");
    setSearchField("all");
    setCategory("all");
    setYear("all");
    setSortBy("newest");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const activeFiltersCount = [
    keyword.trim() !== "",
    searchField !== "all",
    category !== "all",
    year !== "all",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-[#0a2540] via-[#1e3a5f] to-[#0a2540] text-white py-16 px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
              <Search className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Pencarian Buku</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Temukan buku yang Anda cari dengan mudah menggunakan pencarian
            lanjutan dan filter kategori
          </p>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-6">
          {/* Search Box - Main */}
          <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-t-4 border-[#f97316]">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-[#f97316]" />
              <h2 className="text-2xl font-bold text-gray-900">
                Cari Buku Anda
              </h2>
            </div>

            {/* Main Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kata Kunci Pencarian
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Masukkan judul, penulis, atau ISBN..."
                  className="w-full px-4 py-2 pr-12 border-2 text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent transition"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Search className="absolute right-4 top-2 w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Toggle Advanced Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[#f97316] hover:text-[#ea580c] font-medium mb-4 transition"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filter Lanjutan
              {activeFiltersCount > 0 && (
                <span className="bg-[#f97316] text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 mb-6 border border-orange-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cari di Field
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                    >
                      <option value="all">Semua Field</option>
                      <option value="title">Judul</option>
                      <option value="author">Penulis</option>
                      <option value="isbn">ISBN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="all">Semua Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun Terbit
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="all">Semua Tahun</option>
                      {years.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urutkan
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Terbaru</option>
                      <option value="oldest">Terlama</option>
                      <option value="title">Judul (A-Z)</option>
                      <option value="author">Penulis (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-8 py-2 text-md rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-5 h-5" />
                {isLoading ? "Mencari..." : "Cari Sekarang"}
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 text-gray-700 px-8 py-2 text-md rounded-lg hover:bg-gray-300 transition font-medium flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>

          {/* Search Methods Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300">
    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white rounded-xl mb-4">
      <BookOpen className="w-7 h-7" />
    </div>
    <h3 className="font-bold text-lg text-gray-900 mb-2">
      Cari Berdasarkan Judul
    </h3>
    <p className="text-gray-600 text-sm">
      Masukkan kata kunci dari judul buku yang Anda cari
    </p>
  </div>

  <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300">
    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white rounded-xl mb-4">
      <User className="w-7 h-7" />
    </div>
    <h3 className="font-bold text-lg text-gray-900 mb-2">
      Cari Berdasarkan Penulis
    </h3>
    <p className="text-gray-600 text-sm">
      Temukan buku dari penulis atau pengarang favorit Anda
    </p>
  </div>

  <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300">
    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white rounded-xl mb-4">
      <Hash className="w-7 h-7" />
    </div>
    <h3 className="font-bold text-lg text-gray-900 mb-2">
      Cari Berdasarkan ISBN
    </h3>
    <p className="text-gray-600 text-sm">
      Gunakan nomor ISBN untuk pencarian yang lebih spesifik
    </p>
  </div>
</div>


          {/* Search Results */}
          {hasSearched && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[#f97316]" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Hasil Pencarian
                  </h2>
                </div>
                {searchResults.length > 0 && (
                  <div className="bg-[#f97316] text-white px-4 py-2 rounded-full font-semibold">
                    {searchResults.length} Buku
                  </div>
                )}
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                  <p className="text-sm text-gray-600 mb-2">Filter aktif:</p>
                  <div className="flex flex-wrap gap-2">
                    {keyword.trim() && (
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-300">
                        &quot;{keyword}&quot;
                      </span>
                    )}
                    {searchField !== "all" && (
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-300">
                        Field: {searchField}
                      </span>
                    )}
                    {category !== "all" && (
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-300">
                        Kategori: {category}
                      </span>
                    )}
                    {year !== "all" && (
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-300">
                        Tahun: {year}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316] mb-4"></div>
                  <p className="text-gray-500 font-medium">Mencari buku...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Ditemukan{" "}
                    <span className="font-bold text-[#f97316]">
                      {searchResults.length}
                    </span>{" "}
                    buku
                    {keyword.trim() && ` untuk pencarian \"${keyword}\"`}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {searchResults.map((book) => (
                      <BookCard key={book.id} {...book} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Tidak ada hasil ditemukan
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Coba gunakan kata kunci lain atau ubah filter pencarian
                  </p>
                  <button
                    onClick={handleReset}
                    className="bg-[#f97316] text-white px-6 py-3 rounded-lg hover:bg-[#ea580c] transition font-medium"
                  >
                    Reset Pencarian
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Initial State - No Search Yet */}
          {!hasSearched && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-12 text-center border border-blue-100">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                <BookOpen className="w-10 h-10 text-[#f97316]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Siap Mencari Buku?
              </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                Masukkan kata kunci di kolom pencarian di atas dan klik tombol
                &quot;Cari Sekarang&quot; untuk menemukan buku yang Anda inginkan
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
