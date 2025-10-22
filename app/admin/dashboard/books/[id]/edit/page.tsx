"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface FormData {
  title: string;
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  description: string;
  category: string;
  coverImage: string;
}

export default function EditBook() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    publisher: "",
    year: "",
    isbn: "",
    description: "",
    category: "",
    coverImage: "",
  });

  // Fetch existing book data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${params.id}`);

        if (res.ok) {
          const book = await res.json();

          const bookData = {
            title: book.title || "",
            author: book.author || "",
            publisher: book.publisher || "",
            year: book.year ? book.year.toString() : "",
            isbn: book.isbn || "",
            description: book.description || "",
            category: book.category || "",
            coverImage: book.coverImage || "",
          };

          setFormData(bookData);
          setOriginalData(bookData);

          if (book.coverImage) {
            setImagePreview(book.coverImage);
          }
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 2MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, coverImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, coverImage: "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!hasChanges()) {
      alert("Tidak ada perubahan untuk disimpan");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/books/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Buku berhasil diupdate!");
        router.push(`/admin/dashboard/books/${params.id}`);
      } else {
        alert(data.error || "Gagal mengupdate buku");
      }
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Terjadi kesalahan saat mengupdate buku");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/admin/dashboard/books/${params.id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Detail Buku
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Edit Buku
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Ubah informasi buku sesuai kebutuhan
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
                  className="h-56 w-40 rounded-lg object-cover shadow-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1.5 text-white shadow-lg transition-colors hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-56 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-500 hover:bg-blue-50">
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">Upload Cover</span>
                <span className="mt-1 text-xs text-gray-400">Max 2MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
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
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="author"
                required
                value={formData.author}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="year"
                min="1000"
                max="9999"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deskripsi singkat tentang buku..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href={`/admin/dashboard/books/${params.id}`}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting || !hasChanges()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>

          {/* Warning if no changes */}
          {!hasChanges() && !submitting && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                Tidak ada perubahan untuk disimpan
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
