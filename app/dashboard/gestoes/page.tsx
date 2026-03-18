"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Search, X, Trash2, Plus } from "lucide-react";
import { gestaoData, type Gestao } from "@/lib/mock-data";

let nextId = gestaoData.length + 1;

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
function getMonthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}
function groupByMonth(rows: Gestao[]) {
  const map = new Map<string, Gestao[]>();
  [...rows]
    .sort((a, b) => b.data.localeCompare(a.data))
    .forEach((row) => {
      const key = row.data.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
  return map;
}

type EditingCell = { id: number; field: keyof Gestao } | null;

export default function GestoesPage() {
  const [rows, setRows] = useState<Gestao[]>([...gestaoData]);
  const [search, setSearch] = useState("");
  const [activeMonth, setActiveMonth] = useState<string>("todos");
  const [editing, setEditing] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const allMonths = Array.from(new Set(rows.map((r) => r.data.slice(0, 7)))).sort((a, b) =>
    b.localeCompare(a)
  );

  const filtered = rows.filter((r) => {
    const matchSearch =
      search === "" ||
      r.nome.toLowerCase().includes(search.toLowerCase()) ||
      r.feito.toLowerCase().includes(search.toLowerCase());
    const matchMonth = activeMonth === "todos" || r.data.startsWith(activeMonth);
    return matchSearch && matchMonth;
  });

  const grouped = groupByMonth(filtered);

  function startEdit(id: number, field: keyof Gestao, val: string | number) {
    setEditing({ id, field });
    setEditValue(String(val));
  }

  function commitEdit() {
    if (!editing) return;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== editing.id) return row;
        const updated = { ...row };
        if (editing.field === "valor") {
          const p = parseFloat(editValue.replace(",", "."));
          updated.valor = isNaN(p) ? row.valor : p;
        } else {
          (updated as Record<string, unknown>)[editing.field] = editValue;
        }
        return updated;
      })
    );
    setEditing(null);
  }

  function addRowToMonth(yearMonth: string) {
    const today = new Date().toISOString().slice(0, 10);
    const date = today.startsWith(yearMonth) ? today : `${yearMonth}-01`;
    const newRow: Gestao = { id: nextId++, nome: "", valor: 0, data: date, feito: "" };
    setRows((prev) => [...prev, newRow]);
    setTimeout(() => setEditing({ id: newRow.id, field: "nome" }), 50);
  }

  function deleteRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function Cell({
    row,
    field,
    display,
    inputType = "text",
    highlight = false,
  }: {
    row: Gestao;
    field: keyof Gestao;
    display: string;
    inputType?: string;
    highlight?: boolean;
  }) {
    const isEditing = editing?.id === row.id && editing?.field === field;
    return (
      <div
        className="px-4 py-3 rounded-lg cursor-pointer"
        onClick={() => !isEditing && startEdit(row.id, field, row[field])}
        title="Clique para editar"
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type={inputType}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(null);
            }}
            className="w-full px-2 py-1 rounded-lg text-sm outline-none"
            style={{
              background: "var(--color-surface-3)",
              border: "1px solid var(--color-brand)",
              color: "var(--color-text)",
            }}
          />
        ) : (
          <span
            className="text-sm block truncate"
            style={
              highlight
                ? { color: "var(--color-brand)", fontWeight: 600 }
                : display
                ? { color: "var(--color-text)" }
                : { color: "var(--color-border)" }
            }
          >
            {display || "—"}
          </span>
        )}
      </div>
    );
  }

  const totalGeral = filtered.reduce((acc, r) => acc + r.valor, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            Gestões
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Clique em qualquer campo para editar · Enter confirma · Esc cancela
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          <Upload size={15} />
          Importar planilha
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-2xl"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl text-sm outline-none"
            style={{
              background: "var(--color-surface-3)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }}>
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveMonth("todos")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={activeMonth === "todos"
              ? { background: "var(--color-brand)", color: "white" }
              : { background: "var(--color-surface-3)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
          >
            Todos
          </button>
          {allMonths.map((ym) => (
            <button
              key={ym}
              onClick={() => setActiveMonth(ym)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
              style={activeMonth === ym
                ? { background: "var(--color-brand)", color: "white" }
                : { background: "var(--color-surface-3)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
            >
              {new Date(Number(ym.split("-")[0]), Number(ym.split("-")[1]) - 1, 1)
                .toLocaleDateString("pt-BR", { month: "short" })
                .replace(".", "")}{" "}
              {ym.split("-")[0]}
            </button>
          ))}
        </div>
      </div>

      {grouped.size === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-semibold mb-1">Nenhum registro encontrado</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Tente outro filtro ou adicione um novo registro.</p>
        </div>
      )}

      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([yearMonth, monthRows]) => {
          const monthTotal = monthRows.reduce((acc, r) => acc + r.valor, 0);
          return (
            <div key={yearMonth}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold tracking-widest capitalize" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-display)" }}>
                  {getMonthLabel(yearMonth)}
                </h2>
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Total: <span style={{ color: "var(--color-text)", fontWeight: 600 }}>{formatCurrency(monthTotal)}</span>
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
                <div className="overflow-x-auto">
                  <div
                    className="grid text-xs font-semibold uppercase tracking-wider px-2 py-3"
                    style={{ gridTemplateColumns: "2fr 1.2fr 1fr 3fr 36px", minWidth: "600px", background: "var(--color-surface-3)", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}
                  >
                    <span className="px-4">Nome</span>
                    <span className="px-4">Valor</span>
                    <span className="px-4">Data</span>
                    <span className="px-4">O que foi feito</span>
                    <span />
                  </div>

                  {monthRows.map((row, index) => (
                    <div
                      key={row.id}
                      className="grid items-center px-2 group"
                      style={{
                        gridTemplateColumns: "2fr 1.2fr 1fr 3fr 36px",
                        minWidth: "600px",
                        background: index % 2 === 0 ? "var(--color-surface-2)" : "var(--color-surface)",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <Cell row={row} field="nome" display={row.nome} />
                      <Cell row={row} field="valor" display={formatCurrency(row.valor)} inputType="number" highlight />
                      <Cell row={row} field="data" display={formatDate(row.data)} inputType="date" />
                      <Cell row={row} field="feito" display={row.feito} />
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-all opacity-0 group-hover:opacity-60 hover:opacity-100!"
                        style={{ color: "#f87171" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addRowToMonth(yearMonth)}
                  className="w-full flex items-center gap-2 px-6 py-3 text-sm transition-all"
                  style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)", borderTop: "1px dashed var(--color-border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-brand)"; e.currentTarget.style.background = "var(--color-surface-3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "var(--color-surface-2)"; }}
                >
                  <Plus size={14} />
                  Adicionar registro
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {grouped.size > 0 && (
        <div
          className="flex justify-between items-center mt-6 px-5 py-4 rounded-2xl"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
        >
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
          </span>
          <span className="text-sm font-semibold">
            Total geral: <span style={{ color: "var(--color-brand)" }}>{formatCurrency(totalGeral)}</span>
          </span>
        </div>
      )}
    </div>
  );
}
