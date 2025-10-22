import Link from "next/link";
import { BookOpen, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-6 rounded-full">
            <BookOpen className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Buku Tidak Ditemukan
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Maaf, buku yang Anda cari tidak ada dalam katalog kami.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#f97316] text-white px-6 py-3 rounded-md hover:bg-[#ea580c] transition font-medium"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>

          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition font-medium"
          >
            <Search className="w-5 h-5" />
            Cari Buku Lain
          </Link>
        </div>
      </div>
    </div>
  );
}
