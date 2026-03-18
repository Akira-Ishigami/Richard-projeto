"use client";

import { useState } from "react";
import {
  Send, Users, CheckCircle, Clock, MessageSquare,
  Loader2, DollarSign, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";

type Status = "pendente" | "cobrado" | "pago";

type Cliente = {
  id: number;
  nome: string;
  valor: number;
  telefone: string;
  dia_cobranca: number;
  status: Status;
  cobrado_em?: string;
};

const mockClientes: Cliente[] = [
  { id: 1, nome: "João Silva",     valor: 1500.00, telefone: "(11) 99999-1111", dia_cobranca: 5,  status: "pago",     cobrado_em: "05/03/2025" },
  { id: 2, nome: "Maria Oliveira", valor: 3200.00, telefone: "(11) 99999-2222", dia_cobranca: 10, status: "cobrado",  cobrado_em: "10/03/2025" },
  { id: 3, nome: "Carlos Mendes",  valor: 800.00,  telefone: "(11) 99999-3333", dia_cobranca: 15, status: "pendente" },
  { id: 4, nome: "Ana Costa",      valor: 2100.00, telefone: "(11) 99999-4444", dia_cobranca: 20, status: "pendente" },
  { id: 5, nome: "Rafael Souza",   valor: 950.00,  telefone: "(11) 99999-5555", dia_cobranca: 1,  status: "pago",     cobrado_em: "01/03/2025" },
];

const WEBHOOK_URL = "https://n8n.nexladesenvolvimento.com.br/webhook/0b4f66aa-9c8f-49e8-bb6b-91371f390ead";

const statusConfig: Record<Status, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pendente: { label: "Pendente", color: "#facc15", bg: "#facc1512", border: "#facc1530", icon: <Clock size={11} /> },
  cobrado:  { label: "Cobrado",  color: "#60a5fa", bg: "#60a5fa12", border: "#60a5fa30", icon: <Send size={11} /> },
  pago:     { label: "Pago",     color: "#4ade80", bg: "#4ade8012", border: "#4ade8030", icon: <CheckCircle size={11} /> },
};

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function defaultMsg(c: Cliente) {
  return `Olá ${c.nome}! Passando para lembrar que sua cobrança de ${formatCurrency(c.valor)} vence no dia ${c.dia_cobranca}. Qualquer dúvida, estou à disposição!`;
}
async function dispararWebhook(payload: object): Promise<boolean> {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

type PageTab = "cobrancas" | "pagamentos";
type ChargeMode = "individual" | "massa";

function StatusBadge({ status, onClick, title }: { status: Status; onClick?: () => void; title?: string }) {
  const s = statusConfig[status];
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit transition-all"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, cursor: onClick ? "pointer" : "default" }}
    >
      {s.icon}
      {s.label}
    </button>
  );
}

export default function CobrancasPage() {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [pageTab, setPageTab] = useState<PageTab>("cobrancas");
  const [chargeMode, setChargeMode] = useState<ChargeMode>("individual");
  const [filterStatus, setFilterStatus] = useState<Status | "todos">("todos");

  // Individual
  const [openId, setOpenId] = useState<number | null>(null);
  const [mensagens, setMensagens] = useState<Record<number, string>>({});
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);

  // Em massa
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [mensagemMassa, setMensagemMassa] = useState("");
  const [sendingMassa, setSendingMassa] = useState(false);
  const [sentMassa, setSentMassa] = useState(false);

  const totalPendente = clientes.filter((c) => c.status === "pendente").reduce((a, c) => a + c.valor, 0);
  const totalCobrado  = clientes.filter((c) => c.status === "cobrado").reduce((a, c) => a + c.valor, 0);
  const totalPago     = clientes.filter((c) => c.status === "pago").reduce((a, c) => a + c.valor, 0);

  const listaCobrar = clientes.filter((c) =>
    filterStatus === "todos" ? true : c.status === filterStatus
  );

  function getMensagem(c: Cliente) { return mensagens[c.id] ?? defaultMsg(c); }

  function setStatus(id: number, status: Status, cobrado_em?: string) {
    setClientes((p) => p.map((c) => c.id === id ? { ...c, status, ...(cobrado_em ? { cobrado_em } : {}) } : c));
  }

  async function cobrarUm(c: Cliente) {
    setSendingId(c.id);
    setErrorId(null);
    const hoje = new Date().toLocaleDateString("pt-BR");
    const ok = await dispararWebhook({ nome: c.nome, telefone: c.telefone, valor: c.valor, dia_cobranca: c.dia_cobranca, mensagem: getMensagem(c) });
    setSendingId(null);
    if (ok) {
      setStatus(c.id, "cobrado", hoje);
      setOpenId(null);
    } else {
      setErrorId(c.id);
    }
  }

  async function cobrarMassa() {
    const alvos = clientes.filter((c) => selectedIds.has(c.id));
    if (!alvos.length) return;
    setSendingMassa(true);
    const hoje = new Date().toLocaleDateString("pt-BR");
    await Promise.all(alvos.map((c) =>
      dispararWebhook({ nome: c.nome, telefone: c.telefone, valor: c.valor, dia_cobranca: c.dia_cobranca, mensagem: mensagemMassa || defaultMsg(c) })
    ));
    setClientes((p) => p.map((c) => selectedIds.has(c.id) ? { ...c, status: "cobrado", cobrado_em: hoje } : c));
    setSendingMassa(false);
    setSentMassa(true);
    setSelectedIds(new Set());
    setTimeout(() => setSentMassa(false), 3000);
  }

  function toggleSelect(id: number) {
    setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  // Pagamentos: ciclo cobrado → pago → cobrado
  function cyclePago(c: Cliente) {
    if (c.status === "pendente") return;
    setStatus(c.id, c.status === "cobrado" ? "pago" : "cobrado");
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Cobranças
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Gerencie e acompanhe o status de cada cliente
          </p>
        </div>

        {/* Page tabs */}
        <div className="flex rounded-xl p-1 gap-1" style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}>
          {([["cobrancas", "Cobranças"], ["pagamentos", "Pagamentos"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPageTab(key)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={pageTab === key ? { background: "var(--color-brand)", color: "white" } : { color: "var(--color-text-muted)" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(["pendente", "cobrado", "pago"] as Status[]).map((key) => {
          const cfg = statusConfig[key];
          const total = key === "pendente" ? totalPendente : key === "cobrado" ? totalCobrado : totalPago;
          const count = clientes.filter((c) => c.status === key).length;
          return { key, label: cfg.label, value: count, total, color: cfg.color, bg: cfg.bg, border: cfg.border, icon: cfg.icon };
        }).map((s) => (
          <div key={s.key} className="p-4 rounded-2xl" style={{ background: "var(--color-surface-2)", border: `1px solid ${s.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{formatCurrency(s.total)}</p>
          </div>
        ))}
      </div>

      {/* ════════ ABA COBRANÇAS ════════ */}
      {pageTab === "cobrancas" && (
        <div>
          {/* Mode + filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Mode */}
            <div className="flex rounded-xl p-1 gap-1" style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}>
              <button
                onClick={() => setChargeMode("individual")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={chargeMode === "individual" ? { background: "var(--color-brand)", color: "white" } : { color: "var(--color-text-muted)" }}
              >
                <MessageSquare size={13} /> Um por vez
              </button>
              <button
                onClick={() => setChargeMode("massa")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={chargeMode === "massa" ? { background: "var(--color-brand)", color: "white" } : { color: "var(--color-text-muted)" }}
              >
                <Users size={13} /> Em massa
              </button>
            </div>

            {/* Status filter */}
            <div className="flex gap-2 ml-auto flex-wrap">
              {(["todos", "pendente", "cobrado", "pago"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                  style={filterStatus === s
                    ? { background: "var(--color-brand)", color: "white" }
                    : { background: "var(--color-surface-3)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                >
                  {s === "todos" ? "Todos" : statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Individual ── */}
          {chargeMode === "individual" && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              <div
                className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
                style={{ gridTemplateColumns: "2fr 1fr 70px 100px 80px", background: "var(--color-surface-3)", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}
              >
                <span>Cliente</span><span>Valor</span><span>Dia</span><span>Status</span><span />
              </div>

              {listaCobrar.length === 0 && (
                <div className="py-12 text-center text-sm" style={{ color: "var(--color-text-muted)", background: "var(--color-surface-2)" }}>
                  Nenhum cliente com este status.
                </div>
              )}

              {listaCobrar.map((c, i) => {
                const isOpen    = openId === c.id;
                const isSending = sendingId === c.id;
                const hasError  = errorId === c.id;
                return (
                  <div key={c.id}>
                    <div
                      className="grid items-center px-5 py-3 text-sm transition-colors"
                      style={{
                        gridTemplateColumns: "2fr 1fr 70px 100px 80px",
                        background: isOpen ? "var(--color-surface-3)" : i % 2 === 0 ? "var(--color-surface-2)" : "var(--color-surface)",
                        borderBottom: "1px solid var(--color-border)",
                        borderLeft: isOpen ? "2px solid var(--color-brand)" : "2px solid transparent",
                      }}
                    >
                      <div>
                        <p className="font-medium">{c.nome}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.telefone}</p>
                      </div>
                      <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>{formatCurrency(c.valor)}</span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Dia {c.dia_cobranca}</span>
                      <StatusBadge status={c.status} />
                      <button
                        onClick={() => { setOpenId(isOpen ? null : c.id); setErrorId(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ml-auto"
                        style={isOpen
                          ? { background: "var(--color-surface-2)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }
                          : { background: "var(--color-brand)", color: "white" }}
                      >
                        <Send size={11} />
                        {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="px-5 py-4" style={{ background: "var(--color-surface-3)", borderBottom: "1px solid var(--color-border)" }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
                          Mensagem que será enviada · você pode editar antes de enviar
                        </p>
                        <textarea
                          rows={3}
                          value={getMensagem(c)}
                          onChange={(e) => setMensagens((p) => ({ ...p, [c.id]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none mb-3"
                          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                          onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                        />
                        {hasError && (
                          <div className="flex items-center gap-2 mb-3 text-xs px-3 py-2 rounded-lg" style={{ background: "#f8717120", color: "#f87171" }}>
                            <AlertCircle size={13} /> Falha ao enviar. Verifique a conexão e tente novamente.
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            onClick={() => cobrarUm(c)}
                            disabled={isSending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: "var(--color-brand)", color: "white", opacity: isSending ? 0.7 : 1 }}
                          >
                            {isSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            {isSending ? "Enviando..." : "Enviar cobrança"}
                          </button>
                          <button
                            onClick={() => { setOpenId(null); setErrorId(null); }}
                            className="px-4 py-2 rounded-xl text-sm font-semibold"
                            style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Em massa ── */}
          {chargeMode === "massa" && (
            <div>
              <div className="p-4 rounded-2xl mb-4" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <button
                    onClick={() => setSelectedIds(new Set(clientes.filter((c) => c.status === "pendente").map((c) => c.id)))}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "var(--color-surface-3)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                  >
                    Selecionar pendentes
                  </button>
                  {selectedIds.size > 0 && (
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "var(--color-surface-3)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                    >
                      Limpar seleção
                    </button>
                  )}
                  <span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>
                    {selectedIds.size} selecionado{selectedIds.size !== 1 ? "s" : ""}
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Mensagem para todos (opcional — usa mensagem padrão se vazio)"
                  value={mensagemMassa}
                  onChange={(e) => setMensagemMassa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none mb-3"
                  style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={cobrarMassa}
                    disabled={sendingMassa || selectedIds.size === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: selectedIds.size === 0 ? "var(--color-surface-3)" : "var(--color-brand)",
                      color: selectedIds.size === 0 ? "var(--color-text-muted)" : "white",
                    }}
                  >
                    {sendingMassa ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sendingMassa ? "Enviando..." : `Enviar para ${selectedIds.size} cliente${selectedIds.size !== 1 ? "s" : ""}`}
                  </button>
                  {sentMassa && (
                    <span className="text-xs flex items-center gap-1.5" style={{ color: "#4ade80" }}>
                      <CheckCircle size={13} /> Cobranças enviadas! Status atualizado para Cobrado.
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
                <div
                  className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
                  style={{ gridTemplateColumns: "32px 2fr 1fr 70px 100px", background: "var(--color-surface-3)", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}
                >
                  <span /><span>Cliente</span><span>Valor</span><span>Dia</span><span>Status</span>
                </div>
                {clientes.map((c, i) => (
                  <div
                    key={c.id}
                    className="grid items-center px-5 py-3 text-sm cursor-pointer transition-colors"
                    style={{
                      gridTemplateColumns: "32px 2fr 1fr 70px 100px",
                      background: selectedIds.has(c.id) ? "color-mix(in srgb, var(--color-brand) 8%, var(--color-surface-2))" : i % 2 === 0 ? "var(--color-surface-2)" : "var(--color-surface)",
                      borderBottom: i < clientes.length - 1 ? "1px solid var(--color-border)" : "none",
                      borderLeft: selectedIds.has(c.id) ? "2px solid var(--color-brand)" : "2px solid transparent",
                    }}
                    onClick={() => toggleSelect(c.id)}
                  >
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} style={{ accentColor: "var(--color-brand)" }} onClick={(e) => e.stopPropagation()} />
                    <div>
                      <p className="font-medium">{c.nome}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.telefone}</p>
                    </div>
                    <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>{formatCurrency(c.valor)}</span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Dia {c.dia_cobranca}</span>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════ ABA PAGAMENTOS ════════ */}
      {pageTab === "pagamentos" && (
        <div>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
            <div
              className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
              style={{ gridTemplateColumns: "2fr 1fr 120px 1fr", background: "var(--color-surface-3)", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}
            >
              <span>Cliente</span><span>Valor</span><span>Cobrado em</span><span>Status</span>
            </div>

            {clientes.map((c, i) => (
              <div
                key={c.id}
                className="grid items-center px-5 py-3 text-sm"
                style={{
                  gridTemplateColumns: "2fr 1fr 120px 1fr",
                  background: i % 2 === 0 ? "var(--color-surface-2)" : "var(--color-surface)",
                  borderBottom: i < clientes.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <div>
                  <p className="font-medium">{c.nome}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.telefone}</p>
                </div>
                <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>{formatCurrency(c.valor)}</span>
                <span className="text-xs" style={{ color: c.cobrado_em ? "var(--color-text-muted)" : "var(--color-border)" }}>
                  {c.cobrado_em ?? "—"}
                </span>
                <StatusBadge
                  status={c.status}
                  onClick={c.status !== "pendente" ? () => cyclePago(c) : undefined}
                  title={c.status !== "pendente" ? "Clique para alternar entre Cobrado e Pago" : "Ainda não cobrado"}
                />
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-between mt-4 px-4 py-3 rounded-xl text-xs"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
          >
            <span className="flex items-center gap-1.5">
              <DollarSign size={13} style={{ color: "var(--color-brand)" }} />
              Clique no status para alternar entre <strong style={{ color: statusConfig.cobrado.color }}>Cobrado</strong> e <strong style={{ color: statusConfig.pago.color }}>Pago</strong>
            </span>
            <span>
              Total pago: <strong style={{ color: "#4ade80" }}>{formatCurrency(totalPago)}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
