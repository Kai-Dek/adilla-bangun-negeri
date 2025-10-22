"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  role?: string | null;
  created_at?: string | null;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { name: string; role: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const ensureAdminAndLoad = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data?.user || data.user.role !== "ADMIN") {
          router.push("/login");
          return;
        }
      } catch {
        router.push("/login");
        return;
      }

      await loadUsers();
      setLoading(false);
    };
    ensureAdminAndLoad();
  }, [router]);

  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Gagal memuat users");
      const data: AdminUser[] = await res.json();
      setUsers(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Terjadi kesalahan";
      setError(message);
    }
  }

  function startEdit(u: AdminUser) {
    setEditing((prev) => ({ ...prev, [u.id]: { name: u.name || "", role: u.role || "USER" } }));
  }

  function cancelEdit(id: string) {
    setEditing((prev) => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
  }

  async function saveEdit(id: string) {
    const payload = editing[id];
    if (!payload) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Gagal update user");
      await loadUsers();
      cancelEdit(id);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal update user";
      alert(message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Yakin hapus user ini?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Gagal menghapus user");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal menghapus user";
      alert(message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
        <p className="mt-1 text-sm text-gray-600">CRUD user melalui Supabase</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : users.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-center text-gray-600">Belum ada user.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = !!editing[u.id];
                return (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-gray-900">
                      {isEditing ? (
                        <input
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500"
                          value={editing[u.id].name}
                          onChange={(e) =>
                            setEditing((prev) => ({ ...prev, [u.id]: { ...prev[u.id], name: e.target.value } }))
                          }
                        />
                      ) : (
                        u.name || "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{u.email || "-"}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500"
                          value={editing[u.id].role}
                          onChange={(e) =>
                            setEditing((prev) => ({ ...prev, [u.id]: { ...prev[u.id], role: e.target.value } }))
                          }
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{u.role || "USER"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {!isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(u)}
                            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeUser(u.id)}
                            disabled={busyId === u.id}
                            className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => cancelEdit(u.id)}
                            className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => saveEdit(u.id)}
                            disabled={busyId === u.id}
                            className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            Simpan
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


