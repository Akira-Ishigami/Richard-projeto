import { Wrench } from "lucide-react";

export default function ItemsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
      >
        <Wrench size={28} style={{ color: "var(--color-brand)" }} />
      </div>
      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
      >
        Em desenvolvimento
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Esta tela está sendo construída. Em breve estará disponível.
      </p>
    </div>
  );
}
