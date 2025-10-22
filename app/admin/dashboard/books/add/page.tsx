"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddBook() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    year: "",
    isbn: "",
    description: "",
    category: "",
    coverImage: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 2MB");
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }

      // Simpan file untuk upload nanti
      setImageFile(file);

      // Buat preview untuk ditampilkan
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData({ ...formData, coverImage: "" });
  };

  // Fungsi baru untuk upload ke Supabase
  const uploadImageToSupabase = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", imageFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await res.json();
      return data.url; // Return URL dari Supabase
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Gagal upload gambar: " + error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let coverImageUrl: string | null = formData.coverImage;

      if (imageFile) {
        coverImageUrl = await uploadImageToSupabase();
        if (!coverImageUrl) {
          alert("Gagal upload gambar");
          setLoading(false);
          return;
        }
      }

      // Buat book dengan URL dari Supabase
      const bookData = {
        ...formData,
        coverImage: coverImageUrl || "",
      };

      const res = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Buku berhasil ditambahkan!");
        router.push("/admin/dashboard/books");
      } else {
        alert(data.error || "Gagal menambahkan buku");
      }
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Terjadi kesalahan saat menambahkan buku");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard/books"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Kelola Buku
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Tambah Buku Baru
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Isi form di bawah untuk menambahkan buku ke database
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 shadow-sm"
        >
          {/* Cover Image Upload */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Cover Buku
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={160}
                  height={224}
                  className="h-56 w-40 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-56 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-500 hover:bg-blue-50">
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">Upload Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
            {/* Indikator uploading */}
            {uploading && (
              <p className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengupload gambar...
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Judul */}
            <div className="sm:col-span-2">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Judul Buku <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan judul buku"
              />
            </div>

            {/* Penulis */}
            <div>
              <label
                htmlFor="author"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Penulis <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="author"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama penulis"
              />
            </div>

            {/* Publisher */}
            <div>
              <label
                htmlFor="publisher"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Publisher
              </label>
              <input
                type="text"
                id="publisher"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama publisher"
              />
            </div>

            {/* Kategori */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Kategori
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Fiksi, Non-Fiksi, dll"
              />
            </div>

            {/* Tahun */}
            <div>
              <label
                htmlFor="year"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Tahun Terbit
              </label>
              <input
                type="number"
                id="year"
                min="1000"
                max="9999"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024"
              />
            </div>

            {/* ISBN */}
            <div className="sm:col-span-2">
              <label
                htmlFor="isbn"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="978-0-123456-78-9"
              />
            </div>

            {/* Deskripsi */}
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Deskripsi
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deskripsi singkat tentang buku..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/dashboard/books"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Buku"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
