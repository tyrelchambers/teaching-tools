import { useEffect, useRef } from "react";

const SPEEDS = [
  { label: "0.5×", ms: 1400 },
  { label: "1×", ms: 800 },
  { label: "2×", ms: 400 },
  { label: "4×", ms: 200 },
];

export default function StepControls({
  frameIndex,
  frameCount,
  onFrameChange,
  isPlaying,
  onPlayingChange,
  speedIndex,
  onSpeedIndexChange,
  accent = "#10b981",
}) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const ms = SPEEDS[speedIndex]?.ms ?? 800;
    intervalRef.current = setInterval(() => {
      onFrameChange((idx) => {
        if (idx >= frameCount - 1) {
          onPlayingChange(false);
          return frameCount - 1;
        }
        return idx + 1;
      });
    }, ms);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speedIndex, frameCount, onFrameChange, onPlayingChange]);

  const atEnd = frameIndex >= frameCount - 1;
  const atStart = frameIndex <= 0;

  function plainBtn(active = false, disabled = false) {
    return {
      background: active ? "#1c1917" : "transparent",
      border: "1px solid #292524",
      color: disabled ? "#44403c" : active ? "#fafaf9" : "#a8a29e",
      cursor: disabled ? "default" : "pointer",
    };
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border border-stone-800 bg-stone-950">
      <button
        onClick={() => {
          onPlayingChange(false);
          onFrameChange(0);
        }}
        disabled={atStart}
        className="px-2.5 py-1.5 text-sm transition-all"
        style={plainBtn(false, atStart)}
        title="Reset"
      >
        ⏮
      </button>
      <button
        onClick={() => {
          onPlayingChange(false);
          onFrameChange((idx) => Math.max(0, idx - 1));
        }}
        disabled={atStart}
        className="px-2.5 py-1.5 text-sm transition-all"
        style={plainBtn(false, atStart)}
        title="Previous"
      >
        ◀
      </button>
      <button
        onClick={() => {
          if (atEnd) {
            onFrameChange(0);
            onPlayingChange(true);
          } else {
            onPlayingChange(!isPlaying);
          }
        }}
        className="px-3 py-1.5 text-sm font-semibold transition-all"
        style={{
          background: `${accent}15`,
          border: `1px solid ${accent}`,
          color: accent,
        }}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "⏸ pause" : atEnd ? "↻ replay" : "▶ play"}
      </button>
      <button
        onClick={() => {
          onPlayingChange(false);
          onFrameChange((idx) => Math.min(frameCount - 1, idx + 1));
        }}
        disabled={atEnd}
        className="px-2.5 py-1.5 text-sm transition-all"
        style={plainBtn(false, atEnd)}
        title="Next"
      >
        ▶
      </button>

      <div className="flex items-center gap-2 grow min-w-[180px]">
        <input
          type="range"
          min={0}
          max={Math.max(0, frameCount - 1)}
          value={frameIndex}
          onChange={(e) => {
            onPlayingChange(false);
            onFrameChange(Number(e.target.value));
          }}
          className="grow"
          style={{ accentColor: accent }}
        />
        <span className="text-stone-500 text-xs shrink-0 tabular-nums">
          {frameIndex + 1} / {frameCount}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {SPEEDS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => onSpeedIndexChange(i)}
            className="px-2 py-1 text-xs transition-all tabular-nums"
            style={{
              background: i === speedIndex ? "#1c1917" : "transparent",
              color: i === speedIndex ? accent : "#78716c",
              border: i === speedIndex ? `1px solid ${accent}40` : "1px solid transparent",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
