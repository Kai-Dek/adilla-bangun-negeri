"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/pencarian?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0a2540] via-[#1a3a5a] to-[#0a2540] text-white py-20 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">Adilla Bangun Negeri</h1>
        <p className="text-xl mb-8 text-gray-300">
          Menerbitkan karya berkualitas untuk kemajuan pendidikan dan ilmu
          pengetahuan Indonesia
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari berdasarkan judul, penulis, atau ISSN..."
              className="flex-1 px-4 py-3 rounded-md text-gray-900 border-none outline-none bg-[#fff]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-white text-[#0a2540] px-6 py-3 rounded-md hover:bg-gray-100 transition font-medium flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Cari
            </button>
          </div>
        </form>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/katalog")}
            className="bg-[#0a2540] border-2 border-white text-white px-6 py-3 rounded-md hover:bg-[#1a3a5a] transition font-medium"
          >
            Lihat Katalog
          </button>
          <button
            onClick={() => router.push("/pencarian")}
            className="bg-white text-[#0a2540] px-6 py-3 rounded-md hover:bg-gray-100 transition font-medium"
          >
            Pencarian Lanjutan
          </button>
        </div>
      </div>
    </div>
  );
}
