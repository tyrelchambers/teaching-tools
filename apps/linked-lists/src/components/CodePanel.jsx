// Renders an array of source-code lines with the active line highlighted.
// Each line is { text, note? }.

export default function CodePanel({ lines, activeLine, title, accent = "#10b981" }) {
  return (
    <div className="border border-stone-800 bg-stone-950 overflow-hidden">
      {title ? (
        <div
          className="px-4 py-2 text-stone-500 text-[10px] uppercase tracking-widest"
          style={{ borderBottom: "1px solid #292524" }}
        >
          {title}
        </div>
      ) : null}
      <pre className="text-sm leading-relaxed p-0 m-0 overflow-x-auto">
        <code className="block">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isActive = activeLine === lineNum;
            return (
              <div
                key={i}
                className="flex items-start px-4 py-0.5 transition-colors duration-150"
                style={{
                  background: isActive ? `${accent}14` : "transparent",
                  borderLeft: isActive ? `2px solid ${accent}` : "2px solid transparent",
                }}
              >
                <span className="select-none text-stone-600 w-6 text-right pr-3 shrink-0 tabular-nums">
                  {lineNum}
                </span>
                <span style={{ color: isActive ? "#fafaf9" : "#d6d3d1" }}>
                  {line.text}
                  {line.note ? (
                    <span className="text-stone-500 italic ml-2">{line.note}</span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
