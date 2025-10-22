import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { name, role } = await req.json();
    if (!name && !role) {
      return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
    }

    // Update user metadata / app_metadata
    const updates: { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } = {};
    if (name !== undefined) updates.user_metadata = { name };
    if (role !== undefined) updates.app_metadata = { ...(updates.app_metadata || {}), role };

    const { id } = await context.params;
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updates);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      name: (data.user.user_metadata as unknown as Record<string, unknown>)?.name as string | null,
      role: (data.user.app_metadata as unknown as Record<string, unknown>)?.role as string || "USER",
      created_at: data.user.created_at,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


