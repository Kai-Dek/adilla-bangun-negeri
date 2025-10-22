"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteButtonProps {
  bookId: string;
  bookTitle: string;
}

export default function DeleteButton({ bookId, bookTitle }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${bookTitle}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh();
      } else {
        alert(data.error || "Gagal menghapus buku");
        setIsDeleting(false);
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus buku");
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
