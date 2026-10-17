import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: (u.user_metadata as unknown as Record<string, unknown>)?.name as string || u.email?.split("@")[0] || "-",
      role: (u.app_metadata as unknown as Record<string, unknown>)?.role as string || "USER",
      created_at: u.created_at,
    }));
    return NextResponse.json(users);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


