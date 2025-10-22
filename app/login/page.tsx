"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) setError("Email atau password salah");
      else {
        const sres = await fetch("/api/auth/session");
        const session = await sres.json().catch(() => null);
        const email = session?.user?.email as string | undefined;
        const role = session?.user?.role as string | undefined;
        const isAdminAccount = email === "admin@adillabn.com";
        const isAdminRole = role === "ADMIN";
        if (isAdminAccount || isAdminRole) {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Terjadi kesalahan saat login";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Registrasi gagal");
      alert("Registrasi berhasil, silakan login.");
      setMode("login");
      setForm({ name: "", email: "", password: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registrasi gagal";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2540]/5 to-[#f97316]/10 px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8 md:p-10 border border-gray-100/50">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#0a2540] mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600">
            {mode === "login"
              ? "Sign in to your account to continue"
              : "Join us today and start your journey"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          className="space-y-6"
        >
          {mode === "register" && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316] outline-none text-sm transition-all duration-200 bg-gray-50/50 hover:bg-white"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316] outline-none text-sm transition-all duration-200 bg-gray-50/50 hover:bg-white"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316] outline-none text-sm transition-all duration-200 bg-gray-50/50 hover:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg active:from-[#ea580c] active:to-[#dc2626] active:shadow-md"
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Footer Links */}
        {mode === "login" ? (
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <span className="text-gray-600 text-sm">Don&apos;t have an account? </span>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-[#f97316] hover:text-[#ea580c] hover:underline font-medium text-sm transition-colors"
              >
                Sign up here
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-[#f97316] hover:text-[#ea580c] hover:underline font-medium text-sm transition-colors"
            >
              Sign in here
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
