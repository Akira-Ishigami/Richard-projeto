import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import AdminPanel from "./AdminPanel";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { count: totalItems } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true });

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={profile?.role}
        userName={profile?.full_name}
        userEmail={user.email}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Painel Admin
              </h1>
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "rgba(99,102,241,0.2)", color: "var(--color-brand)", border: "1px solid var(--color-brand)" }}
              >
                ADMIN
              </span>
            </div>
            <p style={{ color: "var(--color-text-muted)" }}>
              Visão geral de todos os usuários e dados.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total de usuários", value: allProfiles?.length ?? 0 },
              { label: "Total de itens", value: totalItems ?? 0 },
              { label: "Admins", value: allProfiles?.filter(p => p.role === "admin").length ?? 0 },
            ].map((s) => (
              <div
                key={s.label}
                className="p-5 rounded-2xl"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
              >
                <p className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  {s.value}
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <AdminPanel profiles={allProfiles || []} currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}
