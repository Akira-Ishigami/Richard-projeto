"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check } from "lucide-react";
import type { Profile } from "@/types";

interface ProfileFormProps {
  profile: Profile | null;
  userEmail: string;
}

export default function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const supabase = createClient();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", profile!.id);

    if (error) setError(error.message);
    else setSaved(true);

    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputStyle = {
    background: "var(--color-surface-3)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
  };

  return (
    <div
      className="p-6 rounded-2xl"
      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
    >
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 pb-8" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ background: "var(--color-brand)", color: "white", fontFamily: "var(--font-display)" }}
        >
          {(fullName || userEmail)[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-lg" style={{ fontFamily: "var(--font-display)" }}>
            {fullName || "Sem nome"}
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{userEmail}</p>
          <span
            className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
            style={{
              background: profile?.role === "admin" ? "rgba(99,102,241,0.2)" : "var(--color-surface-3)",
              color: profile?.role === "admin" ? "var(--color-brand)" : "var(--color-text-muted)",
              border: `1px solid ${profile?.role === "admin" ? "var(--color-brand)" : "var(--color-border)"}`,
            }}
          >
            {profile?.role === "admin" ? "Administrador" : "Usuário"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>
            Nome completo
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>
            E-mail
          </label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full px-4 py-3 rounded-xl text-sm outline-none opacity-50 cursor-not-allowed"
            style={inputStyle}
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
            O e-mail não pode ser alterado aqui.
          </p>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>
            Membro desde
          </label>
          <input
            type="text"
            value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "-"}
            disabled
            className="w-full px-4 py-3 rounded-xl text-sm outline-none opacity-50 cursor-not-allowed"
            style={inputStyle}
          />
        </div>

        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "#2d1b1b", border: "1px solid #5c2626", color: "#f87171" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: saved ? "#1b2d1b" : saving ? "var(--color-surface-3)" : "var(--color-brand)",
            color: saved ? "#4ade80" : saving ? "var(--color-text-muted)" : "white",
            border: saved ? "1px solid #265c26" : "none",
          }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saved && <Check size={14} />}
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
