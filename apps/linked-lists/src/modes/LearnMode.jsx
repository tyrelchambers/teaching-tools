import LinkedListDiagram from "../components/LinkedListDiagram.jsx";
import { CONCEPT_SECTIONS } from "../data/concepts.js";

const SECTION_ACCENT = "#10b981";

export default function LearnMode({ onJump }) {
  return (
    <div className="space-y-8">
      <div className="border border-stone-800 bg-stone-900/40 p-6 md:p-8">
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">concepts</div>
        <h2
          className="text-2xl md:text-3xl mb-4 text-stone-100"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
        >
          Six short stops.
        </h2>
        <p className="text-stone-400 leading-relaxed text-sm max-w-2xl">
          Read in order if this is new — skip ahead with the index below if you just want a refresher. Every
          stop has a diagram drawn with the same renderer the techniques use.
        </p>
        <ol className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          {CONCEPT_SECTIONS.map((s, i) => (
            <li key={s.id} className="tabular-nums">
              <a
                href={`#${s.id}`}
                className="text-stone-400 hover:text-stone-100 transition-colors"
              >
                <span className="text-stone-600 mr-3">0{i + 1}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {CONCEPT_SECTIONS.map((section, i) => (
        <article
          key={section.id}
          id={section.id}
          className="border border-stone-800 bg-stone-900/40 p-6 md:p-8 scroll-mt-8 space-y-4"
        >
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-1 tabular-nums">
            stop 0{i + 1}
          </div>
          <h3
            className="text-2xl md:text-3xl text-stone-100"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
          >
            {section.title}
          </h3>
          <div className="space-y-3 max-w-3xl">
            {section.body.map((p, j) => (
              <p key={j} className="text-stone-300 leading-relaxed text-[15px]">
                {p}
              </p>
            ))}
          </div>
          {section.frame ? (
            <div className="pt-2">
              <LinkedListDiagram frame={section.frame} />
            </div>
          ) : null}
        </article>
      ))}

      <div className="border border-stone-800 bg-stone-900/40 p-6 md:p-8">
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">where next</div>
        <h3
          className="text-2xl md:text-3xl text-stone-100 mb-4"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
        >
          You've got the model. Pick a path.
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => onJump?.("techniques")}
            className="text-left px-4 py-3 border transition-all"
            style={{
              borderColor: "#292524",
              color: "#a8a29e",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = SECTION_ACCENT;
              e.currentTarget.style.color = "#fafaf9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#292524";
              e.currentTarget.style.color = "#a8a29e";
            }}
          >
            <div className="font-semibold text-stone-100">→ Techniques</div>
            <div className="text-xs text-stone-500 mt-0.5">step-through demos + sandbox</div>
          </button>
          <button
            onClick={() => onJump?.("pattern")}
            className="text-left px-4 py-3 border transition-all"
            style={{
              borderColor: "#292524",
              color: "#a8a29e",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = SECTION_ACCENT;
              e.currentTarget.style.color = "#fafaf9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#292524";
              e.currentTarget.style.color = "#a8a29e";
            }}
          >
            <div className="font-semibold text-stone-100">→ Patterns</div>
            <div className="text-xs text-stone-500 mt-0.5">spot-the-technique drill</div>
          </button>
        </div>
      </div>
    </div>
  );
}
