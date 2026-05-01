import { useMemo, useState } from "react";
import { PATTERN_OPTIONS, PATTERN_PROBLEMS } from "../data/patterns.js";

const ACCENT = "#a855f7";
const CORRECT = "#10b981";
const WRONG = "#ef4444";

function shuffleOnce(arr, seed) {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function PatternMode() {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const problems = useMemo(() => shuffleOnce(PATTERN_PROBLEMS, seed), [seed]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ correct: 0, answered: 0 });
  const [done, setDone] = useState(false);

  const p = problems[index];

  function pick(id) {
    if (picked !== null) return;
    setPicked(id);
    setScore((s) => ({
      correct: s.correct + (id === p.answer ? 1 : 0),
      answered: s.answered + 1,
    }));
  }

  function next() {
    if (index >= problems.length - 1) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setScore({ correct: 0, answered: 0 });
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score.correct / problems.length) * 100);
    return (
      <div className="border border-stone-800 bg-stone-900/40 p-8 md:p-12 text-center space-y-4">
        <div className="text-xs tracking-widest uppercase text-stone-500">results</div>
        <h2
          className="text-3xl md:text-5xl text-stone-100"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
        >
          {pct === 100 ? "Pattern-spotter." : pct >= 80 ? "Nice eye." : "Worth another lap."}
        </h2>
        <p className="text-stone-400 text-lg tabular-nums">
          You got <span style={{ color: ACCENT }} className="font-bold">{score.correct}</span> of{" "}
          <span className="text-stone-100 font-bold">{problems.length}</span> ({pct}%).
        </p>
        <button
          onClick={restart}
          className="px-6 py-3 mt-4 border font-semibold transition-all"
          style={{ borderColor: ACCENT, background: `${ACCENT}15`, color: ACCENT }}
        >
          start over
        </button>
      </div>
    );
  }

  return (
    <div className="border border-stone-800 bg-stone-900/40 p-6 md:p-8 max-w-3xl mx-auto space-y-5">
      <header>
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">spot the pattern</div>
        <h2
          className="text-2xl md:text-3xl text-stone-100"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
        >
          Pick the technique.
        </h2>
        <p className="text-stone-400 mt-1.5 leading-relaxed text-sm max-w-2xl">
          Read the problem, choose the technique that solves it most directly. Don't worry about implementing
          it — just spot the pattern.
        </p>
      </header>

      <div className="flex items-center justify-between text-sm text-stone-400 tabular-nums">
        <span>
          problem <span className="text-stone-100 font-bold">{index + 1}</span> of {problems.length}
        </span>
        <span>
          score: <span style={{ color: ACCENT }} className="font-bold">{score.correct}</span> / {score.answered}
        </span>
      </div>

      <div className="border border-stone-800 bg-stone-950 p-5 space-y-4">
        <p className="text-stone-100 leading-relaxed text-[15px]">{p.prompt}</p>

        <div className="flex flex-wrap gap-2">
          {PATTERN_OPTIONS.map((opt) => {
            const isPicked = picked === opt.id;
            const isAnswer = opt.id === p.answer;
            let style = {
              background: "transparent",
              borderColor: "#292524",
              color: "#a8a29e",
            };
            if (picked !== null) {
              if (isAnswer) {
                style = { background: `${CORRECT}15`, borderColor: CORRECT, color: "#fafaf9" };
              } else if (isPicked) {
                style = { background: `${WRONG}10`, borderColor: WRONG, color: WRONG };
              } else {
                style = { background: "transparent", borderColor: "#292524", color: "#57534e" };
              }
            }
            return (
              <button
                key={opt.id}
                onClick={() => pick(opt.id)}
                disabled={picked !== null}
                className="px-3 py-1.5 text-sm border transition-all disabled:cursor-default"
                style={style}
                onMouseEnter={(e) => {
                  if (picked !== null) return;
                  e.currentTarget.style.borderColor = ACCENT;
                  e.currentTarget.style.color = "#fafaf9";
                }}
                onMouseLeave={(e) => {
                  if (picked !== null) return;
                  e.currentTarget.style.borderColor = "#292524";
                  e.currentTarget.style.color = "#a8a29e";
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {picked !== null ? (
          <div className="space-y-3 pt-3" style={{ borderTop: "1px solid #292524" }}>
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: picked === p.answer ? CORRECT : WRONG }}
            >
              {picked === p.answer ? "right pattern." : "not the cleanest fit."}
            </p>
            <p className="text-stone-300 text-[15px] leading-relaxed">{p.explain}</p>
            <button
              onClick={next}
              className="px-4 py-2 border font-semibold text-sm transition-all"
              style={{ borderColor: ACCENT, background: `${ACCENT}15`, color: ACCENT }}
            >
              {index >= problems.length - 1 ? "see results →" : "next →"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
