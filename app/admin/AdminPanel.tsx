"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, User, Loader2 } from "lucide-react";
import type { Profile } from "@/types";

interface AdminPanelProps {
  profiles: Profile[];
  currentUserId: string;
}

export default function AdminPanel({ profiles: initialProfiles, currentUserId }: AdminPanelProps) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function toggleRole(profile: Profile) {
    if (profile.id === currentUserId) return;
    setUpdatingId(profile.id);

    const newRole = profile.role === "admin" ? "user" : "admin";
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profile.id);

    if (!error) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, role: newRole } : p))
      );
    }
    setUpdatingId(null);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
    >
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <h2 className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Usuários cadastrados
        </h2>
      </div>

      <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center gap-4 px-5 py-4"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: "var(--color-surface-3)", color: "var(--color-brand)" }}
            >
              {(profile.full_name || profile.email || "?")[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {profile.full_name || "Sem nome"}
                {profile.id === currentUserId && (
                  <span className="ml-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    (você)
                  </span>
                )}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                {profile.email} · {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <button
              onClick={() => toggleRole(profile)}
              disabled={updatingId === profile.id || profile.id === currentUserId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: profile.role === "admin" ? "rgba(99,102,241,0.15)" : "var(--color-surface-3)",
                color: profile.role === "admin" ? "var(--color-brand)" : "var(--color-text-muted)",
                border: `1px solid ${profile.role === "admin" ? "var(--color-brand)" : "var(--color-border)"}`,
              }}
            >
              {updatingId === profile.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : profile.role === "admin" ? (
                <Shield size={12} />
              ) : (
                <User size={12} />
              )}
              {profile.role === "admin" ? "Admin" : "Usuário"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
