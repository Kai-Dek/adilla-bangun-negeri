export const dynamic = "force-dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BookCard from "@/components/BookCard";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Book } from "@prisma/client";
interface HomeCategory {
  name: string | null;
  count: number;
}
interface HomeData {
  latestBooks: Book[];
  totalBooks: number;
  categories: HomeCategory[];
}

// Fetch data di server side
async function getHomeData(): Promise<HomeData> {
  try {
    const [latestBooks, totalBooks, categories] = await Promise.all([
      prisma.book.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.book.count(),
      prisma.book.groupBy({
        by: ["category"],
        _count: {
          category: true,
        },
        where: {
          category: {
            not: null,
          },
        },
      }),
    ]);
    return {
      latestBooks,
      totalBooks,
      categories: categories.map((c) => ({
        name: c.category,
        count: c._count.category,
      })),
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      latestBooks: [],
      totalBooks: 0,
      categories: [],
    };
  }
}

export default async function Home() {
  const { latestBooks, categories } = await getHomeData();

  // Get top 4 categories
  const topCategories = categories
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />

      <main className="flex-1">
        {/* Latest Books Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-[#f97316]" />
                  <h2 className="text-4xl font-bold text-gray-900">
                    Buku Terbaru
                  </h2>
                </div>
                <p className="text-gray-600">
                  Koleksi terbaru dari penulis-penulis terpercaya
                </p>
              </div>
              <Link
                href="/katalog"
                className="hidden md:flex items-center gap-2 text-[#f97316] hover:text-[#ea580c] font-medium transition group"
              >
                Lihat Semua
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {latestBooks.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {latestBooks.map((book) => (
                    <BookCard key={book.id} {...book} />
                  ))}
                </div>

                <div className="text-center md:hidden">
                  <Link
                    href="/katalog"
                    className="inline-flex items-center gap-2 bg-[#f97316] text-white px-8 py-3 rounded-md hover:bg-[#ea580c] transition font-medium"
                  >
                    Lihat Semua Buku
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada buku tersedia</p>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        {topCategories.length > 0 && (
          <section className="py-16 px-6 bg-white">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6 text-[#f97316]" />
                  <h2 className="text-4xl font-bold text-gray-900">
                    Kategori Populer
                  </h2>
                </div>
                <p className="text-gray-600">
                  Jelajahi buku berdasarkan kategori favorit
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topCategories.map((category, index) => {
                  const safeName = category.name ?? "Lainnya";
                  return (
                    <Link
                      key={index}
                      href={`/katalog?category=${encodeURIComponent(
                        safeName
                      )}`}
                      className="group"
                    >
                      <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <BookOpen className="w-8 h-8 text-white" />
                          <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium">
                            {category.count} buku
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {safeName}
                        </h3>
                        <p className="text-white/80 text-sm mb-4">
                          Temukan buku {safeName.toLowerCase()}
                        </p>
                        <div className="flex items-center text-white font-medium group-hover:gap-2 transition-all">
                          Jelajahi
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* About Section - Enhanced */}
        <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Tentang Adilla Bangun Negeri
              </h2>
              <div className="w-20 h-1 bg-[#f97316] mx-auto mb-6"></div>
            </div>

            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  Adilla Bangun Negeri berkomitmen menerbitkan buku-buku
                  berkualitas yang menjadi pilar bagi pendidikan, pengetahuan,
                  dan kecerdasan bangsa.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Setiap karya yang diterbitkan tidak hanya ditujukan untuk
                  memperkaya wawasan, tetapi juga untuk menanamkan nilai-nilai
                  kebangsaan, memperkuat literasi, serta mendukung pembangunan
                  manusia Indonesia yang unggul.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group">
                <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Kualitas Terjamin
                  </h3>
                  <p className="text-gray-600">
                    Setiap publikasi melewati proses seleksi dan penyuntingan
                    yang ketat untuk memastikan kualitas terbaik.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Penulis Profesional
                  </h3>
                  <p className="text-gray-600">
                    Bekerja sama dengan para akademisi dan pakar terkemuka di
                    bidangnya masing-masing.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Standar Internasional
                  </h3>
                  <p className="text-gray-600">
                    Mengikuti standar penerbitan akademik yang diakui dan
                    dihormati secara internasional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-r from-[#0a2540] to-[#1e3a5f]">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Siap Menjelajahi Dunia Literasi?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Temukan ribuan buku berkualitas yang siap memperkaya wawasan dan
              pengetahuan Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/katalog"
                className="inline-flex items-center gap-2 bg-[#f97316] text-white px-8 py-4 rounded-lg hover:bg-[#ea580c] transition font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <BookOpen className="w-6 h-6" />
                Jelajahi Katalog
              </Link>
              <Link
                href="/pencarian"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Cari Buku Spesifik
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

