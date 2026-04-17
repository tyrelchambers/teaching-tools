import React, { useState, useMemo, useEffect } from "react";
import { questions } from "./questions";
import { operators } from "./operators";
import { idioms } from "./idioms";
import {
  MASK, toBits, fromBits, toHex, toBin, toDec, toSignedDec,
  and, or, xor, not, shl, shr, ushr,
  bitsToPolynomial,
} from "./bits";

// ============================================================
// TIER LABELS / COLORS
// ============================================================
const TIER_LABELS = { 1: "Fundamentals", 2: "Recognition", 3: "Application", 4: "Composition", 5: "Traps & Gotchas" };
const tierColors = { 1: "#10b981", 2: "#06b6d4", 3: "#eab308", 4: "#f97316", 5: "#a855f7" };

// Per-mode accent colors (footer/hero/tab tint)
const MODE_ACCENTS = {
  learn: "#f59e0b",
  idioms: "#10b981",
  polynomial: "#a855f7",
  practice: "#06b6d4",
  cheatsheet: "#eab308",
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function BitwiseTeacher() {
  const [mode, setMode] = useState("learn");

  return (
    <div
      className="w-full min-h-screen bg-stone-950 text-stone-200 p-6 md:p-10"
      style={{ fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace" }}
    >
      <div className="max-w-6xl mx-auto">
        <Header mode={mode} />
        <ModeTabs mode={mode} setMode={setMode} />

        {mode === "learn" && <LearnMode />}
        {mode === "idioms" && <IdiomsMode />}
        {mode === "polynomial" && <PolynomialMode />}
        {mode === "practice" && <PracticeMode />}
        {mode === "cheatsheet" && <CheatsheetMode />}

        <footer className="mt-10 text-center text-xs text-stone-600">
          <span className="opacity-60">//</span> thirty-two signed bits, whether you asked for them or not{" "}
          <span className="opacity-60">//</span>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%;
          background: #fbbf24; cursor: pointer; border: 2px solid #0c0a09;
          box-shadow: 0 0 0 1px #fbbf24;
        }
        .slider::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: #fbbf24; cursor: pointer; border: 2px solid #0c0a09;
        }
      `}</style>
    </div>
  );
}

// ============================================================
function Header({ mode }) {
  const accent = MODE_ACCENTS[mode] || "#f59e0b";
  return (
    <header className="mb-6 border-b border-stone-800 pb-6">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-stone-500 text-sm">/* chapter 02 */</span>
        <span className="text-stone-600 text-xs tracking-widest uppercase">bitwise operations</span>
      </div>
      <h1
        className="text-4xl md:text-6xl font-bold tracking-tight"
        style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif", fontStyle: "italic" }}
      >
        Bit<span style={{ color: accent, padding: "0 0.1em", transition: "color 400ms ease" }}>&amp;</span>wise
      </h1>
      <p className="text-stone-400 mt-3 max-w-2xl leading-relaxed text-sm">
        Integers as bits, bits as <em className="text-stone-200 not-italic">polynomials</em>. Click around,
        watch it snap into place.
      </p>
    </header>
  );
}

function ModeTabs({ mode, setMode }) {
  const tabs = [
    { id: "learn",       label: "Learn",      sub: "operators, one by one" },
    { id: "idioms",      label: "Idioms",     sub: "recipes you'll use" },
    { id: "polynomial",  label: "Polynomial", sub: "bits as algebra" },
    { id: "practice",    label: "Practice",   sub: "test yourself" },
    { id: "cheatsheet",  label: "Cheatsheet", sub: "quick reference" },
  ];
  return (
    <div className="flex flex-wrap items-stretch mb-6 border border-stone-800">
      {tabs.map((m, i) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="flex-1 min-w-[140px] px-4 py-3 text-left transition-all duration-200"
            style={{
              background: active ? "#1c1917" : "transparent",
              borderRight: i < tabs.length - 1 ? "1px solid #292524" : "none",
              color: active ? "#fafaf9" : "#78716c",
            }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-stone-600 text-xs tabular-nums">0{i + 1}</span>
              <span className="font-semibold">{m.label}</span>
            </div>
            <div className="text-xs text-stone-600 mt-0.5">{m.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// SHARED: BIT GRID
// Pure render of a width-N bit array. Clicks invoke onToggle(index).
// ============================================================
function BitGrid({
  bits,
  onToggle,
  labels = "index",
  highlight = null,
  origin = null,
  accent = "#fbbf24",
  cell = 32,
  readOnly = false,
  hoverIndex = null,
  onHoverIndex = null,
}) {
  const width = bits.length;
  return (
    <div className="inline-flex flex-col">
      <div className="flex gap-[2px]">
        {bits.map((b, i) => {
          const isHighlighted = highlight && highlight.includes(i);
          const isHovered = hoverIndex === i;
          const originColor =
            origin && origin[i] ? origin[i] : null;
          const clickable = !readOnly && !!onToggle;
          const on = b === 1;
          const borderColor = isHovered
            ? "#fafaf9"
            : originColor
              ? originColor
              : isHighlighted
                ? accent
                : on
                  ? accent
                  : "#44403c";
          const bg = on ? `${accent}26` : "transparent";
          const fg = on ? accent : "#57534e";
          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onToggle(i)}
              onMouseEnter={() => onHoverIndex && onHoverIndex(i)}
              onMouseLeave={() => onHoverIndex && onHoverIndex(null)}
              className={`flex items-center justify-center font-semibold transition-all ${clickable ? "cursor-pointer hover:bg-stone-800/40" : "cursor-default"}`}
              style={{
                width: cell, height: cell,
                border: `1px solid ${borderColor}`,
                background: bg,
                color: fg,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              title={`bit ${width - 1 - i} · place value ${1 << (width - 1 - i)}`}
            >
              {b}
            </button>
          );
        })}
      </div>
      {labels !== "none" && (
        <div className="flex gap-[2px] mt-1">
          {bits.map((_, i) => {
            const power = width - 1 - i;
            return (
              <div
                key={i}
                className="text-[10px] text-stone-600 text-center tabular-nums"
                style={{ width: cell, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {labels === "index" ? `b${power}` : (1 << power)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Shows hex / binary / decimal chips for a value at a given width.
function BaseChips({ n, width = 8 }) {
  return (
    <div className="flex gap-2 flex-wrap text-[11px] tabular-nums mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <span className="px-2 py-0.5 border border-stone-800 text-stone-400">{toHex(n, width)}</span>
      <span className="px-2 py-0.5 border border-stone-800 text-stone-400">{toBin(n, width)}</span>
      <span className="px-2 py-0.5 border border-stone-800 text-stone-400">{toDec(n, width)}</span>
      {width === 8 && (
        <span className="px-2 py-0.5 border border-stone-800/50 text-stone-600">signed: {toSignedDec(n, width)}</span>
      )}
    </div>
  );
}

// Render an integer as a polynomial in x using <sup>. Each term is a span with
// data-power so callers can hover-sync against a BitGrid.
function PolynomialInline({ n, width = 8, hoverPower = null, onHoverPower = null, accent = "#a855f7" }) {
  const terms = bitsToPolynomial(toBits(n, width));
  if (terms.length === 0) {
    return <span className="text-stone-600">0</span>;
  }
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1 leading-relaxed">
      {terms.map((t, i) => {
        const isHover = hoverPower === t.power;
        return (
          <React.Fragment key={t.power}>
            {i > 0 && <span className="text-stone-600 mx-1">+</span>}
            <span
              data-power={t.power}
              onMouseEnter={() => onHoverPower && onHoverPower(t.power)}
              onMouseLeave={() => onHoverPower && onHoverPower(null)}
              className="transition-colors"
              style={{
                color: isHover ? accent : "#e7e5e4",
                borderBottom: isHover ? `1px solid ${accent}` : "1px solid transparent",
                cursor: onHoverPower ? "pointer" : "default",
              }}
            >
              {t.power === 0 ? (
                <>1</>
              ) : (
                <>
                  <span
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 600 }}
                  >
                    x
                  </span>
                  {t.power !== 1 && <sup className="text-[0.7em] ml-[1px]">{t.power}</sup>}
                </>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </span>
  );
}

// ============================================================
// LEARN MODE
// ============================================================
function LearnMode() {
  const [selectedId, setSelectedId] = useState("and");
  const [a, setA] = useState(0b11011010);
  const [b, setB] = useState(0b00001111);
  const [k, setK] = useState(2);
  const [showDerivation, setShowDerivation] = useState(false);
  const width = 8;

  const op = operators.find((o) => o.id === selectedId);

  let result = 0;
  if (op.arity === "binary") {
    if (op.id === "and") result = and(a, b);
    else if (op.id === "or") result = or(a, b);
    else if (op.id === "xor") result = xor(a, b);
  } else if (op.arity === "unary") {
    result = not(a, width);
  } else if (op.arity === "shift") {
    if (op.id === "shl") result = shl(a, k, width);
    else if (op.id === "shr") result = shr(a, k, width);
    else if (op.id === "ushr") result = ushr(a, k, width);
  }

  const aBits = toBits(a, width);
  const bBits = toBits(b, width);
  const rBits = toBits(result, width);

  // Provenance for the result row — which input(s) drove each result-1 bit?
  const origin = useMemo(() => {
    if (!showDerivation) return null;
    const o = new Array(width).fill(null);
    for (let i = 0; i < width; i++) {
      if (rBits[i] !== 1) continue;
      if (op.id === "and") o[i] = "#fbbf24"; // both inputs were 1
      else if (op.id === "or") {
        const fromA = aBits[i] === 1, fromB = bBits[i] === 1;
        o[i] = fromA && fromB ? "#fbbf24" : fromA ? "#f97316" : "#a855f7";
      } else if (op.id === "xor") {
        o[i] = aBits[i] === 1 ? "#f97316" : "#a855f7";
      } else if (op.id === "not") o[i] = "#10b981";
      else o[i] = "#fbbf24";
    }
    return o;
  }, [a, b, result, op.id, showDerivation]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* Sidebar — operator list */}
      <div className="border border-stone-800 bg-stone-900/20">
        <div className="px-4 py-3 border-b border-stone-800 text-xs tracking-widest uppercase text-stone-500">
          operators
        </div>
        <div>
          {operators.map((o) => {
            const active = o.id === selectedId;
            return (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className="w-full text-left px-4 py-3 border-b border-stone-900/70 transition-colors flex items-center gap-3"
                style={{
                  background: active ? "#1c191733" : "transparent",
                  color: active ? "#fafaf9" : "#a8a29e",
                }}
              >
                <span
                  className="shrink-0 font-bold text-base w-8 text-center"
                  style={{ color: active ? o.accent : "#78716c", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {o.symbol}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{o.name}</div>
                  <div className="text-xs text-stone-600 truncate">{o.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail pane */}
      <div className="space-y-6">
        <div className="border border-stone-800 bg-stone-900/20 p-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold" style={{ color: op.accent, fontFamily: "'JetBrains Mono', monospace" }}>
              {op.symbol}
            </span>
            <h2 className="text-2xl" style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>
              {op.name}
            </h2>
            <span className="text-stone-600 text-xs tracking-widest uppercase">{op.label}</span>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            {op.description}
          </p>
        </div>

        {/* Interactive playground */}
        {op.arity !== "intro" && (
          <div className="border border-stone-800 bg-stone-900/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs tracking-widest uppercase text-stone-500">try it — click a bit to toggle</div>
              <label className="text-xs text-stone-500 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDerivation}
                  onChange={(e) => setShowDerivation(e.target.checked)}
                  className="accent-amber-400"
                />
                show derivation
              </label>
            </div>

            <div className="overflow-x-auto">
              <div className="flex items-center gap-4 min-w-max">
                <div className="w-10 text-right text-stone-500 text-xs tabular-nums">A</div>
                <div>
                  <BitGrid
                    bits={aBits}
                    onToggle={(i) => setA(fromBits(aBits.map((bv, idx) => (idx === i ? 1 - bv : bv))))}
                    labels="place"
                    accent={op.accent}
                  />
                  <BaseChips n={a} width={width} />
                </div>
              </div>

              {op.arity === "binary" && (
                <div className="flex items-center gap-4 mt-4 min-w-max">
                  <div className="w-10 text-right text-2xl font-bold tabular-nums" style={{ color: op.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                    {op.symbol}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-stone-500 text-xs tabular-nums">B</span>
                    </div>
                    <BitGrid
                      bits={bBits}
                      onToggle={(i) => setB(fromBits(bBits.map((bv, idx) => (idx === i ? 1 - bv : bv))))}
                      labels="none"
                      accent={op.accent}
                    />
                    <BaseChips n={b} width={width} />
                  </div>
                </div>
              )}

              {op.arity === "shift" && (
                <div className="flex items-center gap-4 mt-4 min-w-max">
                  <div className="w-10 text-right text-2xl font-bold tabular-nums" style={{ color: op.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                    {op.symbol}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 text-xs">k =</span>
                    <input
                      type="range" min={0} max={8} step={1}
                      value={k} onChange={(e) => setK(Number(e.target.value))}
                      className="slider"
                      style={{ width: 160 }}
                    />
                    <span className="text-stone-100 font-bold tabular-nums" style={{ color: op.accent, fontFamily: "'JetBrains Mono', monospace" }}>{k}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 min-w-max">
                <div className="w-10 text-right text-2xl font-bold tabular-nums text-stone-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  =
                </div>
                <div>
                  <BitGrid
                    bits={rBits}
                    labels="none"
                    accent={op.accent}
                    origin={origin}
                    readOnly
                  />
                  <BaseChips n={result} width={width} />
                  {op.arity === "unary" && (
                    <div className="text-[11px] text-stone-500 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      raw (32-bit signed): <span className="text-stone-300">{~a}</span> {" · "}
                      masked (8-bit unsigned): <span className="text-stone-300">{result}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code block */}
        <div className="border border-stone-800 bg-stone-950/60 overflow-hidden">
          <div className="px-4 py-2 border-b border-stone-800 text-xs text-stone-500 bg-stone-900/60">
            in javascript
          </div>
          <div className="p-4 font-mono text-sm leading-relaxed">
            {op.code.map((ln, i) => (
              <div
                key={i}
                className="flex gap-4 px-2 py-0.5 -mx-2"
                style={{
                  background: ln.highlight ? `${op.accent}10` : "transparent",
                  borderLeft: `2px solid ${ln.highlight ? op.accent : "transparent"}`,
                }}
                title={ln.note || ""}
              >
                <span className="text-stone-600 select-none w-6 text-right shrink-0">{i + 1}</span>
                <code className="flex-1 whitespace-pre text-stone-300" style={{ color: ln.highlight ? op.accent : undefined }}>
                  {ln.line}
                </code>
                {ln.note && <span className="text-stone-600 text-xs italic truncate max-w-[320px]">{ln.note}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="border-l-2 pl-5 py-3" style={{ borderColor: op.accent }}>
          <div className="text-xs tracking-widest uppercase mb-2" style={{ color: op.accent }}>why it matters</div>
          <p className="text-stone-300 leading-relaxed mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            {op.explanation}
          </p>
          {op.gotcha && (
            <p className="text-stone-500 text-sm leading-relaxed">
              <span className="text-amber-400/80 font-semibold">gotcha:</span> {op.gotcha}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// IDIOMS MODE
// ============================================================
function IdiomsMode() {
  const [selectedId, setSelectedId] = useState(idioms[0].id);
  const idiom = idioms.find((x) => x.id === selectedId);
  const [n, setN] = useState(idiom.defaultN ?? 0);
  const [k, setK] = useState(idiom.defaultK ?? 0);

  useEffect(() => {
    setN(idiom.defaultN ?? 0);
    setK(idiom.defaultK ?? 0);
  }, [selectedId]);

  const width = 8;
  const result = idiom.run(n, k);
  const rBits = toBits(result, width);
  const nBits = toBits(n, width);

  const accent = "#10b981";

  // Group idioms by category for the sidebar.
  const grouped = useMemo(() => {
    const m = new Map();
    for (const it of idioms) {
      if (!m.has(it.category)) m.set(it.category, []);
      m.get(it.category).push(it);
    }
    return [...m.entries()];
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <div className="border border-stone-800 bg-stone-900/20">
        <div className="px-4 py-3 border-b border-stone-800 text-xs tracking-widest uppercase text-stone-500">
          idioms
        </div>
        <div>
          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <div className="px-4 py-1.5 text-[10px] tracking-widest uppercase text-stone-600 bg-stone-900/40 border-b border-stone-900">
                {cat}
              </div>
              {items.map((it) => {
                const active = it.id === selectedId;
                return (
                  <button
                    key={it.id}
                    onClick={() => setSelectedId(it.id)}
                    className="w-full text-left px-4 py-2.5 border-b border-stone-900/70 transition-colors"
                    style={{
                      background: active ? "#1c191733" : "transparent",
                      color: active ? "#fafaf9" : "#a8a29e",
                      borderLeft: active ? `2px solid ${accent}` : "2px solid transparent",
                    }}
                  >
                    <div className="font-semibold text-sm truncate">{it.name}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="border border-stone-800 bg-stone-900/20 p-6">
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">{idiom.category}</div>
          <h2 className="text-2xl mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>
            {idiom.name}
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            {idiom.problem}
          </p>
        </div>

        <div className="border border-stone-800 bg-stone-950/60 overflow-hidden">
          <div className="px-4 py-2 border-b border-stone-800 text-xs text-stone-500 bg-stone-900/60">
            the recipe
          </div>
          <div className="p-4 font-mono text-sm leading-relaxed">
            {idiom.code.map((ln, i) => (
              <div
                key={i}
                className="flex gap-4 px-2 py-0.5 -mx-2"
                style={{
                  background: ln.highlight ? `${accent}10` : "transparent",
                  borderLeft: `2px solid ${ln.highlight ? accent : "transparent"}`,
                }}
                title={ln.note || ""}
              >
                <span className="text-stone-600 select-none w-6 text-right shrink-0">{i + 1}</span>
                <code className="flex-1 whitespace-pre text-stone-300" style={{ color: ln.highlight ? accent : undefined }}>
                  {ln.line}
                </code>
                {ln.note && <span className="text-stone-600 text-xs italic truncate max-w-[320px]">{ln.note}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-stone-800 bg-stone-900/20 p-6">
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">
            live — click bits in n, drag k if present
          </div>
          <div className="flex flex-col gap-4 overflow-x-auto">
            <div className="flex items-center gap-4 min-w-max">
              <div className="w-10 text-right text-stone-500 text-xs">n</div>
              <div>
                <BitGrid
                  bits={nBits}
                  onToggle={(i) => setN(fromBits(nBits.map((bv, idx) => (idx === i ? 1 - bv : bv))))}
                  labels="place"
                  accent={accent}
                />
                <BaseChips n={n} width={width} />
              </div>
            </div>

            {idiom.defaultK !== undefined && (
              <div className="flex items-center gap-4 min-w-max">
                <div className="w-10 text-right text-stone-500 text-xs">k</div>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={0} max={7} step={1}
                    value={k} onChange={(e) => setK(Number(e.target.value))}
                    className="slider"
                    style={{ width: 200 }}
                  />
                  <span className="text-stone-100 font-bold tabular-nums" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
                    {k}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 min-w-max pt-2 border-t border-stone-800">
              <div className="w-10 text-right text-stone-500 text-xs">→</div>
              <div>
                <BitGrid bits={rBits} labels="none" accent={accent} readOnly />
                <BaseChips n={result} width={width} />
                <div className="text-[11px] text-stone-500 mt-1 italic">{idiom.runLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// POLYNOMIAL MODE
// ============================================================
function PolynomialMode() {
  const [n, setN] = useState(0b1101);
  const [a, setA] = useState(0b1011);
  const [b, setB] = useState(0b0110);
  const [shiftN, setShiftN] = useState(0b01001);
  const [shiftK, setShiftK] = useState(1);
  const width = 8;
  const accent = "#a855f7";

  const [hoverPower, setHoverPower] = useState(null);
  const hoverIndexFromPower = hoverPower === null ? null : width - 1 - hoverPower;

  const nBits = toBits(n, width);
  const aBits = toBits(a, width);
  const bBits = toBits(b, width);
  const xorResult = xor(a, b);
  const xorBits = toBits(xorResult, width);

  const shiftResult = shl(shiftN, shiftK, width);
  const shiftBits = toBits(shiftResult, width);
  const shiftBefore = toBits(shiftN, width);

  // Find powers where a and b both have a 1 (collisions — 1+1=0 in GF(2)).
  const collisions = new Set();
  for (let i = 0; i < width; i++) {
    if (aBits[i] === 1 && bBits[i] === 1) collisions.add(width - 1 - i);
  }

  return (
    <div className="space-y-8">
      {/* Intro card */}
      <div className="border border-stone-800 bg-stone-900/20 p-6">
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">a different model of bits</div>
        <h2 className="text-2xl mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>
          Every byte is a polynomial.
        </h2>
        <p className="text-stone-400 text-sm leading-relaxed max-w-2xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Read the bits of <code className="text-stone-200">0b1101</code> as the coefficients of
          <span className="mx-2"><PolynomialInline n={0b1101} width={4} accent={accent} /></span>.
          Bit at position <em>k</em> becomes the coefficient of <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>x</span>
          <sup>k</sup>. In GF(2), coefficients are taken mod 2 — which means{" "}
          <span className="text-stone-100">XOR is addition</span> and{" "}
          <span className="text-stone-100">shift-left is multiplication by <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>x</span></span>.
        </p>
      </div>

      {/* Panel 1: bits ↔ polynomial with hover sync */}
      <div className="border border-stone-800 bg-stone-900/20 p-6">
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">01 · one number, two representations</div>
        <div className="flex flex-col gap-5 overflow-x-auto">
          <div className="min-w-max">
            <BitGrid
              bits={nBits}
              onToggle={(i) => setN(fromBits(nBits.map((bv, idx) => (idx === i ? 1 - bv : bv))))}
              labels="index"
              accent={accent}
              hoverIndex={hoverIndexFromPower}
              onHoverIndex={(idx) => setHoverPower(idx === null ? null : width - 1 - idx)}
            />
            <BaseChips n={n} width={width} />
          </div>
          <div className="min-w-max">
            <div className="text-[11px] tracking-widest uppercase text-stone-600 mb-2">polynomial form</div>
            <div className="text-2xl md:text-3xl" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <PolynomialInline n={n} width={width} hoverPower={hoverPower} onHoverPower={setHoverPower} accent={accent} />
            </div>
          </div>
          <div className="text-[11px] text-stone-500 leading-relaxed max-w-xl">
            hover a bit or a term to see its partner. each 1-bit at position <em>k</em> contributes a term{" "}
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>x</span><sup>k</sup>. zero-bits are zero terms — they disappear.
          </div>
        </div>
      </div>

      {/* Panel 2: XOR = addition in GF(2) */}
      <div className="border border-stone-800 bg-stone-900/20 p-6">
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">02 · XOR is polynomial addition in GF(2)</div>

        <div className="flex flex-col gap-4 overflow-x-auto">
          <div className="grid grid-cols-[40px_1fr] gap-4 items-center min-w-max">
            <div className="text-stone-500 text-xs text-right">A</div>
            <div>
              <BitGrid
                bits={aBits}
                onToggle={(i) => setA(fromBits(aBits.map((bv, idx) => (idx === i ? 1 - bv : bv))))}
                labels="index"
                accent={accent}
                highlight={[...collisions].map((p) => width - 1 - p)}
              />
              <div className="mt-2 text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <PolynomialInline n={a} width={width} accent={accent} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-4 items-center min-w-max">
            <div className="text-2xl font-bold text-right" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>⊕</div>
            <div>
              <BitGrid
                bits={bBits}
                onToggle={(i) => setB(fromBits(bBits.map((bv, idx) => (idx === i ? 1 - bv : bv))))}
                labels="none"
                accent={accent}
                highlight={[...collisions].map((p) => width - 1 - p)}
              />
              <div className="mt-2 text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <PolynomialInline n={b} width={width} accent={accent} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-4 items-center min-w-max pt-3 border-t border-stone-800">
            <div className="text-2xl font-bold text-right text-stone-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>=</div>
            <div>
              <BitGrid bits={xorBits} labels="none" accent={accent} readOnly />
              <div className="mt-2 text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <PolynomialInline n={xorResult} width={width} accent={accent} />
              </div>
              <BaseChips n={xorResult} width={width} />
            </div>
          </div>

          {collisions.size > 0 && (
            <div className="border-l-2 pl-4 py-2 mt-2" style={{ borderColor: "#ef4444" }}>
              <div className="text-xs tracking-widest uppercase mb-1 text-red-400">1 + 1 = 0 in GF(2)</div>
              <div className="text-stone-300 text-sm leading-relaxed">
                collision at{" "}
                {[...collisions].map((p, i) => (
                  <React.Fragment key={p}>
                    {i > 0 && ", "}
                    <span className="text-stone-100" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>x</span>
                      {p !== 0 && <sup>{p}</sup>}
                    </span>
                  </React.Fragment>
                ))}
                . both polynomials have this term — adding them gives 2·<span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>x</span><sup>k</sup>,
                which is 0 mod 2. that's why the result bit is 0.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel 3: shift = multiply by x */}
      <div className="border border-stone-800 bg-stone-900/20 p-6">
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">03 · shift-left is multiplication by <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>x</span></div>

        <div className="flex flex-col gap-4 overflow-x-auto">
          <div className="grid grid-cols-[40px_1fr] gap-4 items-center min-w-max">
            <div className="text-stone-500 text-xs text-right">before</div>
            <div>
              <BitGrid
                bits={shiftBefore}
                onToggle={(i) => setShiftN(fromBits(shiftBefore.map((bv, idx) => (idx === i ? 1 - bv : bv))))}
                labels="index"
                accent={accent}
              />
              <div className="mt-2 text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <PolynomialInline n={shiftN} width={width} accent={accent} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-4 items-center min-w-max">
            <div className="text-xs text-stone-500 text-right">× x<sup className="text-[0.7em]">{shiftK}</sup></div>
            <div className="flex items-center gap-3">
              <input
                type="range" min={0} max={7} step={1}
                value={shiftK} onChange={(e) => setShiftK(Number(e.target.value))}
                className="slider"
                style={{ width: 200 }}
              />
              <span className="text-stone-100 font-bold tabular-nums" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
                {"<< "}{shiftK}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-4 items-center min-w-max pt-3 border-t border-stone-800">
            <div className="text-stone-500 text-xs text-right">after</div>
            <div>
              <BitGrid bits={shiftBits} labels="none" accent={accent} readOnly />
              <div className="mt-2 text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <PolynomialInline n={shiftResult} width={width} accent={accent} />
              </div>
              <BaseChips n={shiftResult} width={width} />
            </div>
          </div>

          <div className="text-[11px] text-stone-500 max-w-xl leading-relaxed mt-2">
            every term's exponent goes up by <em>k</em>. exponents that exceed {width - 1} fall off the top — that's
            equivalent to reducing modulo <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>x</span><sup>{width}</sup>, which is how
            finite-field arithmetic stays inside a fixed width.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRACTICE MODE — ported from big-o and extended with predict_bits
// ============================================================
const COUNT_OPTIONS = [5, 10, 20, "all"];

function fisherYates(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function PracticeMode() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState([1, 2, 3, 4, 5]);
  const [questionCount, setQuestionCount] = useState(10);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [selectedLines, setSelectedLines] = useState([]);
  const [userBits, setUserBits] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [answeredIds, setAnsweredIds] = useState({});
  const q = activeQuestions[qIndex];

  const poolSize = useMemo(
    () => questions.filter((qq) => selectedTiers.includes(qq.tier)).length,
    [selectedTiers],
  );
  const configColor = tierColors[Math.min(...(selectedTiers.length ? selectedTiers : [1]))] || "#06b6d4";

  const toggleTier = (tier) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier].sort((a, b) => a - b),
    );
  };

  const startQuiz = () => {
    const pool = questions.filter((qq) => selectedTiers.includes(qq.tier));
    const shuffled = fisherYates([...pool]);
    const count = questionCount === "all" ? shuffled.length : Math.min(questionCount, shuffled.length);
    setActiveQuestions(shuffled.slice(0, count));
    setQIndex(0);
    setScore({ correct: 0, total: 0 });
    setAnsweredIds({});
    setUserAnswer(null);
    setSelectedLines([]);
    setUserBits(null);
    setSubmitted(false);
    setQuizStarted(true);
  };

  useEffect(() => {
    setUserAnswer(null);
    setSelectedLines([]);
    setSubmitted(false);
    const cur = activeQuestions[qIndex];
    if (cur && cur.type === "predict_bits") {
      setUserBits(new Array(cur.width).fill(0));
    } else {
      setUserBits(null);
    }
  }, [qIndex, activeQuestions]);

  const practiceColor = tierColors[q?.tier] || "#06b6d4";

  const checkAnswer = () => {
    if (submitted) return;
    let ok = false;
    if (q.type === "multiple_choice" || q.type === "true_false" || q.type === "compare") ok = userAnswer === q.answer;
    else if (q.type === "identify_lines") {
      const su = [...selectedLines].sort((a, b) => a - b);
      const sc = [...q.correctLines].sort((a, b) => a - b);
      ok = su.length === sc.length && su.every((v, i) => v === sc[i]);
    } else if (q.type === "predict_bits") {
      ok = userBits && userBits.length === q.expectedBits.length
        && userBits.every((bv, i) => bv === q.expectedBits[i]);
    }
    setSubmitted(true);
    if (!(q.id in answeredIds)) {
      setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    }
    setAnsweredIds((prev) => ({ ...prev, [q.id]: ok }));
  };

  const isCorrect = () => {
    if (!submitted) return null;
    if (q.type === "multiple_choice" || q.type === "true_false" || q.type === "compare") return userAnswer === q.answer;
    if (q.type === "identify_lines") {
      const su = [...selectedLines].sort((a, b) => a - b);
      const sc = [...q.correctLines].sort((a, b) => a - b);
      return su.length === sc.length && su.every((v, i) => v === sc[i]);
    }
    if (q.type === "predict_bits") {
      return userBits && userBits.every((bv, i) => bv === q.expectedBits[i]);
    }
  };

  const toggleLine = (i) => {
    if (submitted) return;
    setSelectedLines((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  };

  const toggleUserBit = (i) => {
    if (submitted) return;
    setUserBits((prev) => prev.map((bv, idx) => (idx === i ? 1 - bv : bv)));
  };

  const reset = () => {
    setQIndex(0); setScore({ correct: 0, total: 0 }); setAnsweredIds({});
    setUserAnswer(null); setSelectedLines([]); setUserBits(null); setSubmitted(false);
    setActiveQuestions([]);
    setQuizStarted(false);
  };

  if (!quizStarted) {
    const effectiveCount = questionCount === "all" ? poolSize : Math.min(questionCount, poolSize);
    const canStart = selectedTiers.length > 0 && poolSize > 0;
    return (
      <div className="space-y-6">
        <div className="border border-stone-800 bg-stone-900/40 p-6 md:p-8">
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">configure your session</div>
          <h2 className="text-2xl md:text-3xl mb-6 text-stone-100" style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>
            Pick your difficulty. Pick your length.
          </h2>

          <div className="mb-6">
            <div className="text-xs tracking-widest uppercase text-stone-500 mb-3">difficulty</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5].map((tier) => {
                const active = selectedTiers.includes(tier);
                const color = tierColors[tier];
                return (
                  <button key={tier} onClick={() => toggleTier(tier)}
                    className="text-left px-4 py-3 border transition-all flex items-center gap-3"
                    style={{
                      background: active ? `${color}15` : "transparent",
                      borderColor: active ? color : "#292524",
                      color: active ? "#fafaf9" : "#a8a29e",
                    }}>
                    <span className="w-4 h-4 border flex items-center justify-center text-xs shrink-0"
                      style={{ borderColor: active ? color : "#57534e", background: active ? color : "transparent", color: active ? "#0c0a09" : "transparent" }}>
                      {active ? "✓" : ""}
                    </span>
                    <span className="w-2 h-2 shrink-0" style={{ background: color }} />
                    <span className="font-semibold">Tier 0{tier}</span>
                    <span className="text-stone-500 text-sm">— {TIER_LABELS[tier]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs tracking-widest uppercase text-stone-500 mb-3">number of questions</div>
            <div className="grid grid-cols-4 gap-2">
              {COUNT_OPTIONS.map((opt) => {
                const active = questionCount === opt;
                const label = opt === "all" ? `All (${poolSize})` : String(opt);
                return (
                  <button key={String(opt)} onClick={() => setQuestionCount(opt)}
                    className="px-4 py-3 border font-semibold transition-all"
                    style={{
                      background: active ? `${configColor}15` : "transparent",
                      borderColor: active ? configColor : "#292524",
                      color: active ? configColor : "#a8a29e",
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-stone-800 pt-5 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-stone-400">
              {canStart ? (
                <>pool: <span className="text-stone-100 font-bold">{poolSize}</span> question{poolSize === 1 ? "" : "s"} available
                  {" · "}you'll take <span className="text-stone-100 font-bold">{effectiveCount}</span>
                  {questionCount !== "all" && poolSize < questionCount && <span className="text-stone-500"> (max)</span>}</>
              ) : selectedTiers.length === 0 ? (
                <span className="text-stone-500">select at least one tier to continue</span>
              ) : (
                <span className="text-stone-500">no questions match your selection</span>
              )}
            </div>
            <button onClick={startQuiz} disabled={!canStart}
              className="px-6 py-3 border font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: configColor, background: `${configColor}15`, color: configColor }}>
              Start practice →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-900/40 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">
              tier 0{q.tier} — {TIER_LABELS[q.tier]}
            </div>
            <div className="text-sm text-stone-400">
              question <span className="text-stone-100 font-bold">{qIndex + 1}</span> of {activeQuestions.length}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">score</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: practiceColor }}>
              {score.correct}<span className="text-stone-600 text-base"> / {score.total}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {activeQuestions.map((qq, i) => {
            const state = qq.id in answeredIds ? (answeredIds[qq.id] ? "correct" : "wrong")
              : i === qIndex ? "current" : "pending";
            return (
              <button key={qq.id} onClick={() => setQIndex(i)} className="flex-1 min-w-[8px] h-1.5 transition-all"
                style={{
                  background: state === "correct" ? tierColors[qq.tier] : state === "wrong" ? "#ef4444"
                    : state === "current" ? "#a8a29e" : "#292524",
                  opacity: state === "pending" ? 0.5 : 1,
                }}
                title={`Q${i + 1} — Tier ${qq.tier}`} />
            );
          })}
        </div>
      </div>

      <div className="border border-stone-800 bg-stone-900/20 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2" style={{ background: practiceColor }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: practiceColor }}>
            {q.type.replace(/_/g, " ")}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl leading-snug mb-6 text-stone-100"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          {q.prompt}
        </h2>

        {q.code && (
          <div className="border border-stone-800 bg-stone-950/60 mb-6 overflow-hidden">
            <div className="px-4 py-2 border-b border-stone-800 text-xs text-stone-500 bg-stone-900/60">
              {q.type === "identify_lines" ? "click the line(s) that drive the behavior" : "analyze the code"}
            </div>
            <div className="p-4 font-mono text-sm leading-relaxed">
              {q.code.map((ln, i) => {
                const isSelected = selectedLines.includes(i);
                const isCorrectLine = submitted && q.type === "identify_lines" && q.correctLines.includes(i);
                const isWrong = submitted && q.type === "identify_lines" && isSelected && !q.correctLines.includes(i);
                const clickable = q.type === "identify_lines" && !submitted;
                let bg = "transparent", borderColor = "transparent";
                if (q.type === "identify_lines") {
                  if (isCorrectLine) { bg = `${practiceColor}28`; borderColor = practiceColor; }
                  else if (isWrong) { bg = "#ef444422"; borderColor = "#ef4444"; }
                  else if (isSelected) { bg = "#44403c55"; borderColor = "#a8a29e"; }
                }
                return (
                  <div key={i} onClick={() => clickable && toggleLine(i)}
                    className={`flex gap-4 px-2 py-0.5 -mx-2 transition-colors ${clickable ? "cursor-pointer hover:bg-stone-800/40" : ""}`}
                    style={{ background: bg, borderLeft: `2px solid ${borderColor}` }}>
                    <span className="text-stone-600 select-none w-6 text-right shrink-0">{i + 1}</span>
                    <code className="flex-1 whitespace-pre text-stone-300" style={{ color: isCorrectLine ? practiceColor : undefined }}>{ln}</code>
                    {q.type === "identify_lines" && isSelected && !submitted && (
                      <span className="text-stone-500 text-xs">✓ selected</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {q.type === "multiple_choice" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const isSelected = userAnswer === i;
              const isCorrectOpt = submitted && i === q.answer;
              const isWrong = submitted && isSelected && i !== q.answer;
              let bg = "transparent", borderColor = "#292524", textColor = "#d6d3d1";
              if (isCorrectOpt) { bg = `${practiceColor}18`; borderColor = practiceColor; textColor = "#fafaf9"; }
              else if (isWrong) { bg = "#ef444418"; borderColor = "#ef4444"; textColor = "#fca5a5"; }
              else if (isSelected) { bg = "#44403c40"; borderColor = "#78716c"; textColor = "#fafaf9"; }
              return (
                <button key={i} onClick={() => !submitted && setUserAnswer(i)} disabled={submitted}
                  className="text-left px-4 py-3 border transition-all duration-150 flex items-center gap-3"
                  style={{ background: bg, borderColor, color: textColor, cursor: submitted ? "default" : "pointer" }}>
                  <span className="w-6 h-6 border flex items-center justify-center text-xs shrink-0" style={{ borderColor }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-semibold font-mono">{opt}</span>
                  {isCorrectOpt && <span className="ml-auto text-xs" style={{ color: practiceColor }}>✓ correct</span>}
                  {isWrong && <span className="ml-auto text-xs text-red-400">✗ wrong</span>}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "true_false" && (
          <div className="grid grid-cols-2 gap-3">
            {[true, false].map((val) => {
              const isSelected = userAnswer === val;
              const isCorrectOpt = submitted && val === q.answer;
              const isWrong = submitted && isSelected && val !== q.answer;
              let bg = "transparent", borderColor = "#292524";
              if (isCorrectOpt) { bg = `${practiceColor}18`; borderColor = practiceColor; }
              else if (isWrong) { bg = "#ef444418"; borderColor = "#ef4444"; }
              else if (isSelected) { bg = "#44403c40"; borderColor = "#78716c"; }
              return (
                <button key={val.toString()} onClick={() => !submitted && setUserAnswer(val)} disabled={submitted}
                  className="py-6 border text-xl font-bold transition-all"
                  style={{
                    background: bg, borderColor,
                    color: isCorrectOpt ? practiceColor : isWrong ? "#fca5a5" : "#d6d3d1",
                    cursor: submitted ? "default" : "pointer",
                    fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
                  }}>
                  {val ? "True" : "False"}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "compare" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[{ key: "A", data: q.optionA }, { key: "B", data: q.optionB }].map(({ key, data }) => {
              const isSelected = userAnswer === key;
              const isCorrectOpt = submitted && key === q.answer;
              const isWrong = submitted && isSelected && key !== q.answer;
              let bg = "transparent", borderColor = "#292524";
              if (isCorrectOpt) { bg = `${practiceColor}18`; borderColor = practiceColor; }
              else if (isWrong) { bg = "#ef444418"; borderColor = "#ef4444"; }
              else if (isSelected) { bg = "#44403c40"; borderColor = "#78716c"; }
              return (
                <button key={key} onClick={() => !submitted && setUserAnswer(key)} disabled={submitted}
                  className="p-5 border text-left transition-all"
                  style={{ background: bg, borderColor, cursor: submitted ? "default" : "pointer" }}>
                  <div className="text-stone-500 text-xs mb-2">OPTION {key}</div>
                  <div className="text-lg font-bold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isCorrectOpt ? practiceColor : isWrong ? "#fca5a5" : "#fafaf9",
                    }}>
                    {data.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {q.type === "predict_bits" && userBits && (
          <PredictBitsQuestion
            q={q}
            userBits={userBits}
            toggleBit={toggleUserBit}
            submitted={submitted}
            accent={practiceColor}
          />
        )}

        <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
          {!submitted ? (
            <button onClick={checkAnswer}
              disabled={
                q.type === "identify_lines" ? selectedLines.length === 0
                  : q.type === "predict_bits" ? userBits === null
                  : userAnswer === null
              }
              className="px-6 py-3 border font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: practiceColor, background: `${practiceColor}15`, color: practiceColor }}>
              Check answer →
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: isCorrect() ? practiceColor : "#fca5a5" }}>
              {isCorrect() ? "✓ Correct!" : "✗ Not quite."}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => qIndex > 0 && setQIndex(qIndex - 1)} disabled={qIndex === 0}
              className="px-4 py-2 text-sm text-stone-400 border border-stone-800 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed">← prev</button>
            <button onClick={() => qIndex < activeQuestions.length - 1 && setQIndex(qIndex + 1)} disabled={qIndex === activeQuestions.length - 1}
              className="px-4 py-2 text-sm text-stone-400 border border-stone-800 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed">next →</button>
          </div>
        </div>

        {submitted && (
          <div className="mt-6 border-l-2 pl-5 py-3" style={{ borderColor: practiceColor }}>
            <div className="text-xs tracking-widest uppercase mb-2" style={{ color: practiceColor }}>why</div>
            <p className="text-stone-300 leading-relaxed" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {q.explanation}
            </p>
          </div>
        )}
      </div>

      {activeQuestions.length > 0 && score.total === activeQuestions.length && (
        <div className="border-2 p-6 text-center" style={{ borderColor: practiceColor, background: `${practiceColor}08` }}>
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">all done</div>
          <div className="text-5xl font-bold mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif", color: practiceColor }}>
            {score.correct} / {activeQuestions.length}
          </div>
          <div className="text-sm text-stone-400 mb-4">
            {score.correct === activeQuestions.length ? "Perfect score. Bits bend to you now."
              : score.correct >= activeQuestions.length * 0.75 ? "Solid. A few tricky ones remain — review and try again."
              : score.correct >= activeQuestions.length * 0.5 ? "Halfway there. Revisit Learn or Idioms for the ones that tripped you up."
              : "Bits take time. Start with Learn mode, then come back."}
          </div>
          <button onClick={reset} className="px-6 py-2 border text-sm" style={{ borderColor: practiceColor, color: practiceColor }}>new session</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PREDICT BITS — quiz type for clicking the expected output
// ============================================================
function PredictBitsQuestion({ q, userBits, toggleBit, submitted, accent }) {
  const width = q.width;
  const expectedBits = q.expectedBits;
  const wrongIndexes = submitted
    ? userBits.map((bv, i) => (bv !== expectedBits[i] ? i : null)).filter((x) => x !== null)
    : [];

  // Post-submit origin coloring: correct user bits tinted with accent, wrong with red.
  const origin = submitted
    ? userBits.map((bv, i) => (bv === expectedBits[i] ? accent : "#ef4444"))
    : null;

  return (
    <div className="space-y-5">
      {q.expr && (
        <div className="border border-stone-800 bg-stone-950/60 px-4 py-3 font-mono text-sm">
          <span className="text-stone-500 text-xs mr-3">expression</span>
          <code className="text-stone-200">{q.expr}</code>
        </div>
      )}

      {q.operands && q.operands.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs tracking-widest uppercase text-stone-500">given</div>
          {q.operands.map((opnd, idx) => (
            <div key={idx} className="flex items-center gap-4 overflow-x-auto">
              <div className="w-10 text-right text-stone-500 text-xs shrink-0">{opnd.label}</div>
              <div>
                <BitGrid bits={opnd.bits} labels={idx === 0 ? "index" : "none"} accent={accent} readOnly />
                <BaseChips n={fromBits(opnd.bits)} width={width} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs tracking-widest uppercase text-stone-500">
          {submitted ? "your answer" : "click bits to predict the result"}
        </div>
        <div className="flex items-center gap-4 overflow-x-auto">
          <div className="w-10 text-right text-stone-500 text-xs shrink-0">=</div>
          <div>
            <BitGrid
              bits={userBits}
              onToggle={toggleBit}
              labels={q.operands ? "none" : "index"}
              accent={accent}
              origin={origin}
              readOnly={submitted}
            />
            <BaseChips n={fromBits(userBits)} width={width} />
          </div>
        </div>
      </div>

      {submitted && wrongIndexes.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs tracking-widest uppercase text-red-400">expected</div>
          <div className="flex items-center gap-4 overflow-x-auto">
            <div className="w-10 text-right text-stone-500 text-xs shrink-0">=</div>
            <div>
              <BitGrid bits={expectedBits} labels="none" accent={accent} readOnly />
              <BaseChips n={fromBits(expectedBits)} width={width} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHEATSHEET
// ============================================================
function CheatsheetMode() {
  const rows = [
    { sym: "&",   name: "AND",   arity: "binary", example: "0b1101 & 0b1010",     equals: "0b1000", desc: "Keep bits set in both.",                gotcha: "(n & 0) === 0 for all n." },
    { sym: "|",   name: "OR",    arity: "binary", example: "0b1001 | 0b0110",     equals: "0b1111", desc: "Set bits from either.",                 gotcha: "(n | 0) coerces to Int32." },
    { sym: "^",   name: "XOR",   arity: "binary", example: "0b1101 ^ 0b1010",     equals: "0b0111", desc: "Flip bits that differ.",                 gotcha: "(a ^ a) === 0 — its own inverse." },
    { sym: "~",   name: "NOT",   arity: "unary",  example: "~0b00000101",          equals: "-6 (sign-extended)", desc: "Flip every bit.",           gotcha: "Result is Int32 — mask to clip." },
    { sym: "<<",  name: "SHL",   arity: "shift",  example: "1 << 3",               equals: "8",       desc: "Shift left by k; zeros fill right.",   gotcha: "Shift amount is mod 32." },
    { sym: ">>",  name: "SHR",   arity: "shift",  example: "(-8) >> 2",            equals: "-2",      desc: "Arithmetic right — sign-extended.",    gotcha: "(-1) >> n is still -1." },
    { sym: ">>>", name: "USHR",  arity: "shift",  example: "(-1) >>> 0",           equals: "4294967295", desc: "Logical right — zeros fill left.",   gotcha: "Only unsigned bitwise op in JS." },
  ];
  const arityColor = { binary: "#06b6d4", unary: "#a855f7", shift: "#f97316" };

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-900/20 p-4 text-sm text-stone-400 leading-relaxed"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        <p>
          A quick reference for JS bitwise operators. Hover a row for the gotcha. All ops coerce their
          operands to 32-bit signed ints before running (BigInt variants are the exception).
        </p>
      </div>

      <div className="border border-stone-800 bg-stone-900/20 overflow-x-auto">
        <table className="w-full text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <thead>
            <tr className="border-b border-stone-800">
              <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-stone-500 font-normal w-16">op</th>
              <th className="text-left px-3 py-3 text-xs tracking-widest uppercase text-stone-500 font-normal">name</th>
              <th className="text-left px-3 py-3 text-xs tracking-widest uppercase text-stone-500 font-normal">arity</th>
              <th className="text-left px-3 py-3 text-xs tracking-widest uppercase text-stone-500 font-normal">example</th>
              <th className="text-left px-3 py-3 text-xs tracking-widest uppercase text-stone-500 font-normal">⇒</th>
              <th className="text-left px-3 py-3 text-xs tracking-widest uppercase text-stone-500 font-normal">what it does</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sym} className="border-b border-stone-900 hover:bg-stone-900/30 transition-colors group">
                <td className="px-4 py-3">
                  <span className="text-xl font-bold text-amber-400">{r.sym}</span>
                </td>
                <td className="px-3 py-3 text-stone-100 font-semibold">{r.name}</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-0.5 border text-xs"
                    style={{ borderColor: `${arityColor[r.arity]}44`, color: arityColor[r.arity], background: `${arityColor[r.arity]}08` }}>
                    {r.arity}
                  </span>
                </td>
                <td className="px-3 py-3 text-stone-300">{r.example}</td>
                <td className="px-3 py-3 text-amber-300/90">{r.equals}</td>
                <td className="px-3 py-3 text-stone-400">
                  {r.desc}
                  <div className="text-stone-500 text-xs mt-1 italic opacity-0 group-hover:opacity-100 transition-opacity">
                    gotcha: {r.gotcha}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { c: "#f59e0b", label: "amber = the app accent" },
          { c: "#06b6d4", label: "binary ops take two operands" },
          { c: "#a855f7", label: "unary ops take one" },
          { c: "#f97316", label: "shifts take n and a shift amount k" },
          { c: "#10b981", label: "GF(2): XOR is addition, << is ×x" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 border"
            style={{ borderColor: `${l.c}44`, background: `${l.c}08` }}>
            <span className="w-2 h-2" style={{ background: l.c }} />
            <span className="text-stone-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
