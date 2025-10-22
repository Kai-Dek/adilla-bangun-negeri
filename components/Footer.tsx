import Link from "next/link";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a2540] text-white py-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-[#f97316]" />
              <span className="text-xl font-bold">Adilla Bangun Negeri</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
                Penerbit yang berkomitmen menghadirkan buku-buku berkualitas sebagai 
                sarana mencerdaskan kehidupan bangsa. Dengan mengusung semangat literasi dan pendidikan, kami menerbitkan 
                karya yang relevan, inspiratif, dan bermanfaat bagi pembaca dari berbagai kalangan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/katalog"
                  className="text-gray-300 hover:text-white transition"
                >
                  Katalog
                </Link>
              </li>
              <li>
                <Link
                  href="/pencarian"
                  className="text-gray-300 hover:text-white transition"
                >
                  Pencarian
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Email: adillamedia@gmail.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Telepon: +62 812-7635-5543
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Pasir Putih, Tebing, Padang, Sumbar, Indonesia
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          © 2025 Adilla Bangun Negeri. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
