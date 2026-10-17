import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth so it appears in admin Kelola User
    const supabaseAdmin = getSupabaseAdmin();

    const { data: created, error: supaErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role: "USER" },
    });

    if (supaErr) {
      return NextResponse.json(
        { error: supaErr.message || "Gagal membuat user di Supabase" },
        { status: 500 }
      );
    }

    // Hash password for local table
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mirror into Prisma user table (use Supabase user id)
    const user = await prisma.user.create({
      data: {
        id: created.user.id,
        email,
        password: hashedPassword,
        name,
        role: "USER",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}
