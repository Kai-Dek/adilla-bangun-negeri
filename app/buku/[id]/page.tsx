import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookmarkButtonWrapper from "@/components/BookmarkButtonWrapper";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  User,
  Calendar,
  Hash,
  Tag,
  Building2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

interface BookDetailPageContext {
  params: Promise<{ id: string }>;
}

async function getBook(id: string) {
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        bookmarks: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    return book;
  } catch {
    return null;
  }
}

export default async function BookDetailPage({ params }: BookDetailPageContext) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header/Breadcrumb */}
      <div className="bg-[#0a2540] text-white py-8 px-6">
        <div className="container mx-auto">
          <nav className="text-sm mb-4">
            <Link href="/" className="hover:underline">
              Beranda
            </Link>
            <span className="mx-2">/</span>
            <Link href="/katalog" className="hover:underline">
              Katalog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">{book.title}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
              {/* Cover Image */}
              <div className="md:col-span-1">
                <div className="relative aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <BookmarkButtonWrapper bookId={book.id} />
                  <ShareButton title={book.title} urlPath={`/buku/${book.id}`} />
                </div>
              </div>

              {/* Book Details */}
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {book.title}
                </h1>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-[#f97316] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Penulis</p>
                      <p className="font-semibold text-gray-900">
                        {book.author}
                      </p>
                    </div>
                  </div>

                  {book.isbn && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Hash className="w-5 h-5 text-[#f97316] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">ISBN</p>
                        <p className="font-semibold text-gray-900">
                          {book.isbn}
                        </p>
                      </div>
                    </div>
                  )}

                  {book.publisher && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-[#f97316] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Penerbit</p>
                        <p className="font-semibold text-gray-900">
                          {book.publisher}
                        </p>
                      </div>
                    </div>
                  )}

                  {book.year && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-[#f97316] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Tahun Terbit</p>
                        <p className="font-semibold text-gray-900">
                          {book.year}
                        </p>
                      </div>
                    </div>
                  )}

                  {book.category && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Tag className="w-5 h-5 text-[#f97316] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Kategori</p>
                        <p className="font-semibold text-gray-900">
                          {book.category}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {book.description && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Deskripsi Buku
                    </h2>
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      {book.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BookDetailPageContext) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    return {
      title: "Buku Tidak Ditemukan",
    };
  }

  return {
    title: `${book.title} - Adilla Bangun Negeri`,
    description: book.description || `Buku ${book.title} karya ${book.author}`,
  };
}
