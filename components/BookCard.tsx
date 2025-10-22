import Link from "next/link";
import { BookOpen } from "lucide-react";
import Image from "next/image";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  year?: number | null;
  category?: string | null;
  coverImage?: string | null;
}

export default function BookCard({
  id,
  title,
  author,
  year,
  category,
  coverImage,
}: BookCardProps) {
  return (
    <Link href={`/buku/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Category Badge */}
          {category && (
            <div className="absolute top-2 right-2">
              <span className="bg-[#f97316] text-white text-xs px-3 py-1 rounded-full font-medium">
                {category}
              </span>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#f97316] transition-colors">
            {title}
          </h3>

          <p className="text-gray-600 text-sm mb-2 line-clamp-1">{author}</p>

          {year && (
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
              <span className="text-gray-500 text-sm">{year}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
