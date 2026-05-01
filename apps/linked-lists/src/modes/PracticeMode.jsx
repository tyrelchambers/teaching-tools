import { useMemo, useState } from "react";
import { QUIZ } from "../data/quiz.js";

const ACCENT = "#f59e0b";
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

export default function PracticeMode() {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const questions = useMemo(() => shuffleOnce(QUIZ, seed), [seed]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ correct: 0, answered: 0 });
  const [done, setDone] = useState(false);

  const q = questions[index];
  const isCorrect = picked === q.answer;

  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    setScore((s) => ({
      correct: s.correct + (i === q.answer ? 1 : 0),
      answered: s.answered + 1,
    }));
  }

  function next() {
    if (index >= questions.length - 1) {
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
    const pct = Math.round((score.correct / questions.length) * 100);
    return (
      <div className="border border-stone-800 bg-stone-900/40 p-8 md:p-12 text-center space-y-4">
        <div className="text-xs tracking-widest uppercase text-stone-500">results</div>
        <h2
          className="text-3xl md:text-5xl text-stone-100"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
        >
          {pct === 100 ? "Spotless." : pct >= 80 ? "Nicely done." : pct >= 60 ? "Solid." : "Worth another pass."}
        </h2>
        <p className="text-stone-400 text-lg tabular-nums">
          You got <span style={{ color: ACCENT }} className="font-bold">{score.correct}</span> of{" "}
          <span className="text-stone-100 font-bold">{questions.length}</span> ({pct}%).
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
      <header className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">quiz</div>
          <h2
            className="text-2xl md:text-3xl text-stone-100"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
          >
            Question{" "}
            <span className="text-stone-100 font-bold tabular-nums">{index + 1}</span>{" "}
            <span className="text-stone-500">of {questions.length}</span>
          </h2>
        </div>
        <div className="text-sm text-stone-400 tabular-nums">
          score:{" "}
          <span style={{ color: ACCENT }} className="font-bold">{score.correct}</span>{" "}
          / {score.answered}
        </div>
      </header>

      <div className="border border-stone-800 bg-stone-950 p-5 space-y-4">
        <p className="text-stone-100 leading-relaxed whitespace-pre-wrap text-[15px]">{q.prompt}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isAnswer = i === q.answer;
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
                key={i}
                onClick={() => pick(i)}
                disabled={picked !== null}
                className="text-left px-4 py-3 border text-sm transition-all disabled:cursor-default"
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
                <span className="text-stone-600 mr-2 font-semibold">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {picked !== null ? (
          <div className="space-y-3 pt-3" style={{ borderTop: "1px solid #292524" }}>
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: isCorrect ? CORRECT : WRONG }}
            >
              {isCorrect ? "correct." : "not quite."}
            </p>
            <p className="text-stone-300 text-[15px] leading-relaxed">{q.explain}</p>
            <button
              onClick={next}
              className="px-4 py-2 border font-semibold text-sm transition-all"
              style={{ borderColor: ACCENT, background: `${ACCENT}15`, color: ACCENT }}
            >
              {index >= questions.length - 1 ? "see results →" : "next →"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
