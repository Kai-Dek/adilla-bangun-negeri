"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BookFormProps {
  book?: {
    id: string;
    title: string;
    author: string;
    publisher: string | null;
    year: number | null;
    isbn: string | null;
    description: string | null;
    category: string | null;
    coverImage: string | null;
  };
  isEdit?: boolean;
}

export default function BookForm({ book, isEdit = false }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    publisher: book?.publisher || "",
    year: book?.year?.toString() || "",
    isbn: book?.isbn || "",
    description: book?.description || "",
    category: book?.category || "",
    coverImage: book?.coverImage || "",
  });

  const categories = [
    "Metodologi Penelitian",
    "Psikologi",
    "Ekonomi Islam",
    "Tafsir",
    "Hadis",
    "Pendidikan",
    "Fiqih",
    "Sejarah",
    "Manajemen",
    "Tasawuf",
    "Ushul Fiqh",
    "Dakwah",
    "Bahasa Arab",
    "Akhlak",
    "Filsafat",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/books/${book?.id}` : "/api/books";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }

      router.push("/admin/dashboard/books");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Judul Buku */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Judul Buku <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
            placeholder="Masukkan judul buku"
          />
        </div>

        {/* Penulis */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Penulis <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
            placeholder="Masukkan nama penulis"
          />
        </div>

        {/* Penerbit */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Penerbit
          </label>
          <input
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
            placeholder="Masukkan nama penerbit"
          />
        </div>

        {/* ISBN */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
            placeholder="978-xxx-xxxx-xx-x"
          />
        </div>

        {/* Tahun */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tahun Terbit
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1900"
            max="2100"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
            placeholder="2024"
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kategori
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Cover Image URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            URL Gambar Cover
          </label>
          <input
            type="url"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
            placeholder="https://example.com/cover.jpg"
          />
          {formData.coverImage && (
            <div className="mt-3">
              <Image
                src={formData.coverImage}
                alt="Preview"
                width={160}
                height={240}
                className="h-40 w-auto rounded-lg border border-gray-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                }}
              />
            </div>
          )}
        </div>

        {/* Deskripsi */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deskripsi
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
            placeholder="Masukkan deskripsi buku"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {loading ? "Menyimpan..." : isEdit ? "Update Buku" : "Tambah Buku"}
        </button>
        <Link
          href="/admin/dashboard/books"
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <X className="w-5 h-5" />
          Batal
        </Link>
      </div>
    </form>
  );
}
