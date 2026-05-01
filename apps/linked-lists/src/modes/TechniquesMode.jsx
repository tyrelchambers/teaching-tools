import { useEffect, useMemo, useState } from "react";
import LinkedListDiagram from "../components/LinkedListDiagram.jsx";
import CodePanel from "../components/CodePanel.jsx";
import StepControls from "../components/StepControls.jsx";
import Sandbox from "../components/Sandbox.jsx";
import { TECHNIQUES, getTechniqueById } from "../data/techniques.js";

const ACCENT = "#06b6d4";
const CATEGORY_ORDER = ["Pattern", "Two-pointer", "Transform", "Composite", "List type"];

function TechniquePicker({ activeId, onPick }) {
  const grouped = useMemo(() => {
    const map = new Map();
    for (const t of TECHNIQUES) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category).push(t);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => [c, map.get(c)]);
  }, []);

  return (
    <nav className="border border-stone-800 bg-stone-900/40">
      {grouped.map(([cat, items], gi) => (
        <div key={cat} style={{ borderTop: gi === 0 ? "none" : "1px solid #292524" }}>
          <div className="px-3 pt-3 pb-2 text-stone-500 text-[10px] uppercase tracking-widest tabular-nums">
            0{gi + 1} · {cat}
          </div>
          {items.map((t) => {
            const active = activeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onPick(t.id)}
                className="w-full text-left px-3 py-2 text-sm transition-all"
                style={{
                  background: active ? "#1c1917" : "transparent",
                  color: active ? "#fafaf9" : "#a8a29e",
                  borderLeft: active ? `2px solid ${ACCENT}` : "2px solid transparent",
                }}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function InputEditor({ values, onChange }) {
  const [text, setText] = useState(values.join(", "));
  useEffect(() => {
    setText(values.join(", "));
  }, [values]);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-stone-500 text-xs tracking-widest uppercase">input</span>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const parsed = text
            .split(/[,\s]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n));
          if (parsed.length > 0) onChange(parsed);
          else setText(values.join(", "));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.target.blur();
        }}
        className="px-3 py-1.5 bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-stone-600 w-72"
      />
    </div>
  );
}

function SubTab({ id, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-semibold border transition-all"
      style={{
        background: active ? "#1c1917" : "transparent",
        borderColor: active ? ACCENT : "#292524",
        color: active ? "#fafaf9" : "#78716c",
      }}
    >
      {label}
    </button>
  );
}

export default function TechniquesMode() {
  const [activeId, setActiveId] = useState(TECHNIQUES[0].id);
  const [subTab, setSubTab] = useState("demo");
  const [input, setInput] = useState(() => TECHNIQUES[0].defaultInput);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [sandboxSeed, setSandboxSeed] = useState(null);

  const technique = getTechniqueById(activeId);

  const frames = useMemo(() => {
    try {
      return technique.runner(input);
    } catch (e) {
      console.error("runner failed", e);
      return [];
    }
  }, [technique, input]);

  useEffect(() => {
    setFrameIndex(0);
    setIsPlaying(false);
  }, [activeId, input]);

  const handleTechniqueChange = (id) => {
    setActiveId(id);
    const t = getTechniqueById(id);
    setInput(t.defaultInput);
    setSubTab("demo");
  };

  const currentFrame = frames[frameIndex] ?? null;

  const sendToSandbox = () => {
    setSandboxSeed({ values: input, technique: activeId, ts: Date.now() });
    setSubTab("sandbox");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <TechniquePicker activeId={activeId} onPick={handleTechniqueChange} />
      </aside>

      <section>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <SubTab label="step-through" active={subTab === "demo"} onClick={() => setSubTab("demo")} />
          <SubTab label="sandbox" active={subTab === "sandbox"} onClick={() => setSubTab("sandbox")} />
          <span className="grow" />
          {subTab === "demo" ? (
            <button
              onClick={sendToSandbox}
              className="px-3 py-2 text-xs font-semibold border transition-all"
              style={{ borderColor: "#292524", color: "#a8a29e", background: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = "#fafaf9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#292524"; e.currentTarget.style.color = "#a8a29e"; }}
              title="Open this list in the sandbox"
            >
              try it yourself →
            </button>
          ) : null}
        </div>

        {subTab === "demo" ? (
          <div className="border border-stone-800 bg-stone-900/40 p-6 md:p-8 space-y-5">
            <header>
              <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">{technique.category.toLowerCase()}</div>
              <h2
                className="text-2xl md:text-3xl text-stone-100 mb-2"
                style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
              >
                {technique.name}
              </h2>
              <p className="text-stone-400 mt-1.5 leading-relaxed text-sm max-w-3xl">
                {technique.summary}
              </p>
            </header>

            <InputEditor values={input} onChange={setInput} />

            <LinkedListDiagram frame={currentFrame} />

            <StepControls
              frameIndex={frameIndex}
              frameCount={frames.length}
              onFrameChange={(arg) =>
                typeof arg === "function"
                  ? setFrameIndex((i) => arg(i))
                  : setFrameIndex(arg)
              }
              isPlaying={isPlaying}
              onPlayingChange={setIsPlaying}
              speedIndex={speedIndex}
              onSpeedIndexChange={setSpeedIndex}
              accent={ACCENT}
            />

            <CodePanel
              lines={technique.code}
              activeLine={currentFrame ? currentFrame.line : null}
              title={technique.id}
              accent={ACCENT}
            />
          </div>
        ) : (
          <Sandbox seed={sandboxSeed} accent={ACCENT} />
        )}
      </section>
    </div>
  );
}
