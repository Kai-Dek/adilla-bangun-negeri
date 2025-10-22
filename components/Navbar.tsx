"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/katalog", label: "Katalog" },
    { href: "/pencarian", label: "Pencarian" },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-[#0a2540] text-white transition-all duration-300 ${
          isScrolled ? "shadow-lg py-3" : "py-4"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold hover:opacity-90 transition-opacity group"
            >
              <div className="bg-[#f97316] p-2 rounded-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:inline">Adilla Bangun Negeri</span>
              <span className="sm:hidden">ABN</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md transition-all font-medium ${
                    isActive(link.href)
                      ? "bg-[#f97316] text-white"
                      : "hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {status === "loading" ? (
                <div className="animate-pulse bg-gray-300 h-10 w-24 rounded-md"></div>
              ) : session ? (
                <>
                  <span className="text-sm text-gray-300">
                    Hi, {session.user.name}
                  </span>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-[#f97316] text-white px-6 py-2 rounded-md hover:bg-[#ea580c] transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-[72px] right-0 h-[calc(100vh-72px)] w-80 max-w-[85vw] bg-[#0a2540] z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6 px-6">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-md transition-all font-medium ${
                    isActive(link.href)
                      ? "bg-[#f97316] text-white"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="my-6 border-t border-white/10"></div>

            <div className="space-y-2">
              {session ? (
                <>
                  <div className="px-4 py-3 bg-white/10 rounded-md">
                    <p className="text-sm text-gray-300">Logged in as</p>
                    <p className="font-medium text-white">
                      {session.user.name}
                    </p>
                  </div>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md bg-red-600 text-white hover:bg-red-700 transition font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-md bg-[#f97316] text-white hover:bg-[#ea580c] transition font-medium"
                >
                  <User className="w-5 h-5" />
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 p-6">
            <p className="text-gray-400 text-sm text-center">
              © 2024 Adilla Bangun Negeri
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
