"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setSuccess("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      setError(msg === "Invalid login credentials" ? "E-mail ou senha incorretos." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-surface)" }}>
      {/* Left panel - decorative */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "var(--color-surface-2)" }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "var(--color-brand)" }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-brand)" }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            MeuProjeto
          </span>
        </div>

        <div className="relative z-10">
          <h1
            className="text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            Bem-vindo de
            <br />
            <span style={{ color: "var(--color-brand)" }}>volta.</span>
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-lg max-w-xs">
            Acesse sua conta e continue de onde parou.
          </p>
        </div>

        <div className="relative z-10 flex gap-4">
          {["🔒 Seguro", "⚡ Rápido", "🎯 Simples"].map((tag) => (
            <span
              key={tag}
              className="text-sm px-3 py-1.5 rounded-full"
              style={{
                background: "var(--color-surface-3)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-brand)" }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              MeuProjeto
            </span>
          </div>

          <h2
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="mb-8" style={{ color: "var(--color-text-muted)" }}>
            {mode === "login"
              ? "Digite suas credenciais abaixo"
              : "Preencha os dados para se cadastrar"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>
                  Nome completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="João Silva"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "#2d1b1b", border: "1px solid #5c2626", color: "#f87171" }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "#1b2d1b", border: "1px solid #265c26", color: "#4ade80" }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: loading ? "var(--color-surface-3)" : "var(--color-brand)",
                color: loading ? "var(--color-text-muted)" : "white",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setSuccess(null); }}
              className="font-semibold"
              style={{ color: "var(--color-brand)" }}
            >
              {mode === "login" ? "Criar conta" : "Entrar"}
            </button>
          </p>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>acesso demo</span>
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            </div>
            <button
              type="button"
              onClick={() => {
                document.cookie = "mock-auth=user; path=/; max-age=86400";
                router.push("/dashboard");
                router.refresh();
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              Entrar como Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
