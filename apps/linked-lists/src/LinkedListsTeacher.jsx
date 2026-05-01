import { useState } from "react";
import LearnMode from "./modes/LearnMode.jsx";
import TechniquesMode from "./modes/TechniquesMode.jsx";
import PracticeMode from "./modes/PracticeMode.jsx";
import PatternMode from "./modes/PatternMode.jsx";

const MODE_ACCENTS = {
  learn: "#10b981",
  techniques: "#06b6d4",
  practice: "#f59e0b",
  pattern: "#a855f7",
};

export default function LinkedListsTeacher() {
  const [mode, setMode] = useState("learn");

  return (
    <div
      className="w-full min-h-screen bg-stone-950 text-stone-200 p-6 md:p-10"
      style={{ fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace" }}
    >
      <div className="max-w-6xl mx-auto">
        <Header mode={mode} />
        <ModeTabs mode={mode} setMode={setMode} />

        {mode === "learn" && <LearnMode onJump={(id) => setMode(id)} />}
        {mode === "techniques" && <TechniquesMode />}
        {mode === "practice" && <PracticeMode />}
        {mode === "pattern" && <PatternMode />}

        <footer className="mt-10 text-center text-xs text-stone-600">
          <span className="opacity-60">//</span> a value, a pointer, and the discipline to never lose the head{" "}
          <span className="opacity-60">//</span>
        </footer>
      </div>
    </div>
  );
}

function Header({ mode }) {
  const accent = MODE_ACCENTS[mode] || "#10b981";
  return (
    <header className="mb-6 border-b border-stone-800 pb-6">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-stone-500 text-sm">/* chapter 03 */</span>
        <span className="text-stone-600 text-xs tracking-widest uppercase">data structures</span>
      </div>
      <h1
        className="text-4xl md:text-6xl font-bold tracking-tight"
        style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif", fontStyle: "italic" }}
      >
        Linked
        <span style={{ color: accent, padding: "0 0.1em", transition: "color 400ms ease" }}>L</span>
        ists
      </h1>
      <p className="text-stone-400 mt-3 max-w-2xl leading-relaxed text-sm">
        Pointers, traced step by step. Watch dummy heads, two-pointer walks, reversals, and cycles
        unfold one frame at a time — then build your <em className="text-stone-200 not-italic">own</em>.
      </p>
    </header>
  );
}

function ModeTabs({ mode, setMode }) {
  const tabs = [
    { id: "learn", label: "Learn", sub: "build the mental model" },
    { id: "techniques", label: "Techniques", sub: "step-through demos + sandbox" },
    { id: "practice", label: "Practice", sub: "test yourself" },
    { id: "pattern", label: "Patterns", sub: "pick the right tool" },
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
