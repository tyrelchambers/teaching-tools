import React, { useState, useMemo, useEffect, useRef } from "react";
import { questions } from "./questions";
import { optimizations } from "./optimizations";

// ============================================================
// COMPLEXITIES DATA
// ============================================================
const complexities = [
  {
    id: "o1",
    name: "O(1)",
    label: "Constant",
    color: "#10b981",
    accent: "#6ee7b7",
    description:
      "The operation takes the same amount of time regardless of input size. A single lookup, a direct index, a hash access.",
    code: [
      { line: "function getFirst(arr) {", highlight: false },
      { line: "  return arr[0];", highlight: true, note: "Direct index — one operation, always." },
      { line: "}", highlight: false },
    ],
    explanation:
      "There's no loop. No recursion. We reach in, grab one thing, return it. Array of 10? One step. Array of 10 million? Still one step. The highlighted line is the entire complexity story.",
    curve: (n) => 1,
  },
  {
    id: "ologn",
    name: "O(log n)",
    label: "Logarithmic",
    color: "#06b6d4",
    accent: "#67e8f9",
    description:
      "Each step eliminates half of what's left. Doubling the input adds just one more step. This is the complexity of efficient search.",
    code: [
      { line: "function binarySearch(arr, target) {", highlight: false },
      { line: "  let lo = 0, hi = arr.length - 1;", highlight: false },
      { line: "  while (lo <= hi) {", highlight: true, note: "The loop halves the range each pass — that's the log." },
      { line: "    const mid = (lo + hi) >> 1;", highlight: false },
      { line: "    if (arr[mid] === target) return mid;", highlight: false },
      { line: "    if (arr[mid] < target) lo = mid + 1;", highlight: true, note: "Discards half." },
      { line: "    else hi = mid - 1;", highlight: true, note: "Discards the other half." },
      { line: "  }", highlight: false },
      { line: "  return -1;", highlight: false },
      { line: "}", highlight: false },
    ],
    explanation:
      "1024 items take ~10 comparisons. 1,048,576 items take ~20. You can double the input and it costs one more step. The while-loop is the engine, and the branches that discard half of the range are what make it logarithmic.",
    curve: (n) => Math.log2(Math.max(n, 1)),
  },
  {
    id: "on",
    name: "O(n)",
    label: "Linear",
    color: "#eab308",
    accent: "#fde047",
    description:
      "You touch each element once. Double the input, double the work. Predictable, honest, and often the best you can do.",
    code: [
      { line: "function sum(arr) {", highlight: false },
      { line: "  let total = 0;", highlight: false },
      { line: "  for (let i = 0; i < arr.length; i++) {", highlight: true, note: "Single pass over n elements." },
      { line: "    total += arr[i];", highlight: true, note: "Constant work, done n times." },
      { line: "  }", highlight: false },
      { line: "  return total;", highlight: false },
      { line: "}", highlight: false },
    ],
    explanation:
      "One loop over the array. The body does a constant amount of work, but it runs n times — so the total scales directly with n. That single for-loop is what defines this as linear.",
    curve: (n) => n,
  },
  {
    id: "onlogn",
    name: "O(n log n)",
    label: "Linearithmic",
    color: "#f97316",
    accent: "#fdba74",
    description:
      "The hallmark of efficient sorting. You do log n passes, and each pass touches n elements.",
    code: [
      { line: "function mergeSort(arr) {", highlight: false },
      { line: "  if (arr.length <= 1) return arr;", highlight: false },
      { line: "  const mid = arr.length >> 1;", highlight: false },
      { line: "  const left  = mergeSort(arr.slice(0, mid));", highlight: true, note: "Recursion splits: log n levels deep." },
      { line: "  const right = mergeSort(arr.slice(mid));", highlight: true, note: "Recursion splits: log n levels deep." },
      { line: "  return merge(left, right);", highlight: true, note: "Merge does n work at each level." },
      { line: "}", highlight: false },
    ],
    explanation:
      "Splitting creates a recursion tree log n levels tall. Merging at each level processes every element once — that's n work per level. Multiply them: n log n. Merge sort, heap sort, and efficient quicksort all live here.",
    curve: (n) => n * Math.log2(Math.max(n, 1)),
  },
  {
    id: "on2",
    name: "O(n\u00b2)",
    label: "Quadratic",
    color: "#ef4444",
    accent: "#fca5a5",
    description:
      "Nested loops over the same data. Double the input, quadruple the work. Fine for small n, brutal for large n.",
    code: [
      { line: "function hasDuplicate(arr) {", highlight: false },
      { line: "  for (let i = 0; i < arr.length; i++) {", highlight: true, note: "Outer loop: n iterations." },
      { line: "    for (let j = i + 1; j < arr.length; j++) {", highlight: true, note: "Inner loop: up to n more iterations, for each i." },
      { line: "      if (arr[i] === arr[j]) return true;", highlight: false },
      { line: "    }", highlight: false },
      { line: "  }", highlight: false },
      { line: "  return false;", highlight: false },
      { line: "}", highlight: false },
    ],
    explanation:
      "Two nested loops, each going up to n. Together that's n \u00d7 n operations. 100 items = 10,000 checks. 10,000 items = 100 million. This is the classic shape of bubble sort, insertion sort, and naive pair-wise comparisons.",
    curve: (n) => n * n,
  },
  {
    id: "o2n",
    name: "O(2\u207F)",
    label: "Exponential",
    color: "#a855f7",
    accent: "#d8b4fe",
    description:
      "Every additional element doubles the total work. This is where algorithms go to die — usable only for tiny inputs.",
    code: [
      { line: "function fib(n) {", highlight: false },
      { line: "  if (n <= 1) return n;", highlight: false },
      { line: "  return fib(n - 1) + fib(n - 2);", highlight: true, note: "Two recursive calls per invocation \u2014 tree grows as 2\u207F." },
      { line: "}", highlight: false },
    ],
    explanation:
      "Each call branches into two more calls. The call tree nearly doubles at every level. fib(30) is already ~1 billion calls. fib(50) would take years. Memoization or iteration cuts this to O(n) — a hint that sometimes the complexity isn't in the problem, it's in the approach.",
    curve: (n) => Math.pow(2, Math.min(n, 30)),
  },
];

const TIER_LABELS = { 1: "Fundamentals", 2: "Recognition", 3: "Comparison", 4: "Decomposition", 5: "Traps & Subtlety" };
const tierColors = { 1: "#10b981", 2: "#06b6d4", 3: "#eab308", 4: "#f97316", 5: "#a855f7" };

// ============================================================
// ALGORITHM CASES (best / average / worst)
// ============================================================
const algorithmCases = [
  {
    id: "linearSearch",
    name: "Linear Search",
    description: "Walk the array from start to end looking for a target.",
    best: { complexity: "O(1)", label: "Best", when: "Target is the first element.", color: "#10b981" },
    average: { complexity: "O(n)", label: "Average", when: "Target is somewhere in the middle — on average, you check n/2 elements.", color: "#eab308" },
    worst: { complexity: "O(n)", label: "Worst", when: "Target is the last element, or not present — you check every element.", color: "#ef4444" },
    insight: "Linear search has the same average and worst case because both require scanning most of the array. Only the lucky first-element case is fast.",
  },
  {
    id: "binarySearch",
    name: "Binary Search",
    description: "Halve the search range each step on a sorted array.",
    best: { complexity: "O(1)", label: "Best", when: "The middle element is the target on the first check.", color: "#10b981" },
    average: { complexity: "O(log n)", label: "Average", when: "Target requires halving the range several times.", color: "#06b6d4" },
    worst: { complexity: "O(log n)", label: "Worst", when: "Target isn't present — you halve until the range is empty.", color: "#06b6d4" },
    insight: "Binary search is beautifully consistent: the worst case is only O(log n), same as average. But the array must be sorted first — that's O(n log n) up front.",
  },
  {
    id: "quicksort",
    name: "Quicksort",
    description: "Pick a pivot, partition the array, recurse on both halves.",
    best: { complexity: "O(n log n)", label: "Best", when: "The pivot always splits the array evenly — you get log n levels of n work.", color: "#f97316" },
    average: { complexity: "O(n log n)", label: "Average", when: "Random pivots give reasonably balanced splits most of the time.", color: "#f97316" },
    worst: { complexity: "O(n\u00b2)", label: "Worst", when: "The pivot is always the smallest (or largest) — one side is empty, the recursion is n levels deep.", color: "#ef4444" },
    insight: "Quicksort's worst case is a trap: an already-sorted array with a naive pivot choice. Real implementations use randomized or median-of-three pivots to make the worst case nearly impossible.",
  },
  {
    id: "hashLookup",
    name: "Hash Map Lookup",
    description: "Use a hash function to jump directly to the key's bucket.",
    best: { complexity: "O(1)", label: "Best", when: "No collision — direct bucket access.", color: "#10b981" },
    average: { complexity: "O(1)", label: "Average", when: "A good hash function distributes keys evenly across buckets.", color: "#10b981" },
    worst: { complexity: "O(n)", label: "Worst", when: "Every key hashes to the same bucket — the map degrades to a linked list.", color: "#ef4444" },
    insight: "Hash maps sell you O(1) on average — but that promise depends on a good hash function and a reasonable load factor. With adversarial inputs or bad hashes, all bets are off.",
  },
  {
    id: "insertionSort",
    name: "Insertion Sort",
    description: "Build a sorted prefix one element at a time, shifting as needed.",
    best: { complexity: "O(n)", label: "Best", when: "Array is already sorted — each new element just checks against its predecessor.", color: "#eab308" },
    average: { complexity: "O(n\u00b2)", label: "Average", when: "Each insertion shifts about half the sorted prefix.", color: "#ef4444" },
    worst: { complexity: "O(n\u00b2)", label: "Worst", when: "Array is sorted in reverse — every element must travel the full distance.", color: "#ef4444" },
    insight: "Insertion sort is a rare win: on nearly-sorted data, it's O(n) — faster than merge sort in practice. That's why Timsort and introsort use it for small or partially-sorted subarrays.",
  },
];

// ============================================================
// DATA STRUCTURE CHEAT SHEET
// ============================================================
const complexityTint = (c) => {
  const map = {
    "O(1)": "#10b981",
    "O(log n)": "#06b6d4",
    "O(n)": "#eab308",
    "O(n log n)": "#f97316",
    "O(n\u00b2)": "#ef4444",
    "\u2014": "#57534e",
  };
  return map[c] || "#78716c";
};

const dataStructures = [
  {
    id: "array", name: "Array",
    description: "Contiguous block of memory. Indexing is direct arithmetic, but insertion means shifting everything after.",
    ops: {
      access:  { c: "O(1)", note: "Index jumps straight to memory address." },
      search:  { c: "O(n)", note: "Must scan from start — no structure to exploit." },
      insert:  { c: "O(n)", note: "Shift all subsequent elements to make room." },
      delete:  { c: "O(n)", note: "Shift elements down to close the gap." },
      appendEnd: { c: "O(1)", note: "Amortized — occasional resize is O(n) but rare." },
    },
  },
  {
    id: "linkedList", name: "Linked List",
    description: "Nodes connected by pointers. No contiguous memory — fast insertion at known positions, slow access by index.",
    ops: {
      access:  { c: "O(n)", note: "Walk from head until you hit the index." },
      search:  { c: "O(n)", note: "Traverse node by node." },
      insert:  { c: "O(1)", note: "If you already have a pointer to the position." },
      delete:  { c: "O(1)", note: "If you already have a pointer to the node." },
      appendEnd: { c: "O(1)", note: "With a tail pointer; O(n) without one." },
    },
  },
  {
    id: "hashMap", name: "Hash Map",
    description: "Key-to-bucket via a hash function. Fast on average, but pathological inputs and bad hashes can ruin it.",
    ops: {
      access:  { c: "O(1)", note: "Average case — worst is O(n) if all keys collide." },
      search:  { c: "O(1)", note: "Average case with a good hash function." },
      insert:  { c: "O(1)", note: "Amortized — occasional rehash is O(n)." },
      delete:  { c: "O(1)", note: "Find the bucket, remove the entry." },
      appendEnd: { c: "\u2014", note: "Hash maps don't have order; 'append' isn't meaningful." },
    },
  },
  {
    id: "bst", name: "Binary Search Tree (balanced)",
    description: "Each node has up to two children; smaller keys left, larger right. Kept balanced (e.g., red-black) to guarantee log n depth.",
    ops: {
      access:  { c: "O(log n)", note: "Tree depth is log n when balanced." },
      search:  { c: "O(log n)", note: "Halve the search space at each node." },
      insert:  { c: "O(log n)", note: "Navigate to leaf position, then rebalance." },
      delete:  { c: "O(log n)", note: "Find, remove, and restore balance." },
      appendEnd: { c: "\u2014", note: "BSTs don't have a defined 'end' — they're ordered by key, not position." },
    },
  },
  {
    id: "heap", name: "Binary Heap",
    description: "Complete tree where the root holds the min (or max). Built for priority queues — fast peek, log-time insert and extract.",
    ops: {
      access:  { c: "O(1)", note: "Only the root (min/max) is directly accessible." },
      search:  { c: "O(n)", note: "No ordering between siblings — must scan." },
      insert:  { c: "O(log n)", note: "Bubble up from the last position." },
      delete:  { c: "O(log n)", note: "Remove root, move last to top, sift down." },
      appendEnd: { c: "\u2014", note: "Heaps maintain heap-order, not insertion order." },
    },
  },
  {
    id: "stack", name: "Stack",
    description: "Last-in, first-out. Push and pop at the top. Usually backed by an array or linked list.",
    ops: {
      access:  { c: "O(1)", note: "Only the top element is accessible." },
      search:  { c: "O(n)", note: "Must pop through elements to find one." },
      insert:  { c: "O(1)", note: "Push onto the top." },
      delete:  { c: "O(1)", note: "Pop from the top." },
      appendEnd: { c: "O(1)", note: "Push — the top is the end." },
    },
  },
  {
    id: "queue", name: "Queue",
    description: "First-in, first-out. Enqueue at the back, dequeue from the front.",
    ops: {
      access:  { c: "O(1)", note: "Only front (peek) is directly accessible." },
      search:  { c: "O(n)", note: "Must scan through — queues aren't searchable by design." },
      insert:  { c: "O(1)", note: "Enqueue at the back." },
      delete:  { c: "O(1)", note: "Dequeue from the front." },
      appendEnd: { c: "O(1)", note: "Enqueue — the back is the end." },
    },
  },
];

const opColumns = [
  { key: "access", label: "Access" },
  { key: "search", label: "Search" },
  { key: "insert", label: "Insert" },
  { key: "delete", label: "Delete" },
  { key: "appendEnd", label: "Append End" },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function BigOTeacher() {
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
        {mode === "practice" && <PracticeMode />}
        {mode === "optimize" && <OptimizeMode />}
        {mode === "race" && <RaceMode />}
        {mode === "cases" && <CasesMode />}
        {mode === "cheatsheet" && <CheatsheetMode />}

        <footer className="mt-10 text-center text-xs text-stone-600">
          <span className="opacity-60">//</span> describing growth, not measuring time{" "}
          <span className="opacity-60">//</span>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%;
          background: #a8a29e; cursor: pointer; border: 2px solid #0c0a09;
          box-shadow: 0 0 0 1px #a8a29e;
        }
        .slider::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: #a8a29e; cursor: pointer; border: 2px solid #0c0a09;
        }
      `}</style>
    </div>
  );
}

// ============================================================
function Header({ mode }) {
  const accent = mode === "practice" ? "#06b6d4"
    : mode === "optimize" ? "#14b8a6"
    : mode === "race" ? "#f97316"
    : mode === "cases" ? "#a855f7"
    : mode === "cheatsheet" ? "#eab308"
    : "#ef4444";
  return (
    <header className="mb-6 border-b border-stone-800 pb-6">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-stone-500 text-sm">/* chapter 01 */</span>
        <span className="text-stone-600 text-xs tracking-widest uppercase">algorithmic complexity</span>
      </div>
      <h1
        className="text-4xl md:text-6xl font-bold tracking-tight"
        style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif", fontStyle: "italic" }}
      >
        Big <span style={{ color: accent, transition: "color 400ms ease" }}>O</span> Notation
      </h1>
      <p className="text-stone-400 mt-3 max-w-2xl leading-relaxed text-sm">
        A way to describe how an algorithm's runtime grows as its input grows. Not stopwatch seconds —
        the <em className="text-stone-200 not-italic">shape</em> of the growth.
      </p>
    </header>
  );
}

function ModeTabs({ mode, setMode }) {
  const tabs = [
    { id: "learn", label: "Learn", sub: "explore the concepts" },
    { id: "practice", label: "Practice", sub: "test yourself" },
    { id: "optimize", label: "Optimize", sub: "n\u00b2 \u2192 n patterns" },
    { id: "race", label: "Race", sub: "watch them run" },
    { id: "cases", label: "Cases", sub: "best / avg / worst" },
    { id: "cheatsheet", label: "Cheatsheet", sub: "structures \u00d7 ops" },
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
// LEARN MODE
// ============================================================
function LearnMode() {
  const [selected, setSelected] = useState("on2");
  const [n, setN] = useState(16);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [compareMode, setCompareMode] = useState(true);

  const current = complexities.find((c) => c.id === selected);

  const W = 680, H = 280;
  const PAD = { l: 48, r: 20, t: 20, b: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxN = 64;
  const maxY = Math.max(n * n, 64 * 64);
  const yScale = (v) => PAD.t + chartH - (Math.log10(v + 1) / Math.log10(maxY + 1)) * chartH;
  const xScale = (v) => PAD.l + (v / maxN) * chartW;
  const buildPath = (fn) => {
    const pts = [];
    for (let x = 0; x <= maxN; x += 1) pts.push(`${xScale(x).toFixed(2)},${yScale(fn(x)).toFixed(2)}`);
    return "M" + pts.join(" L");
  };
  const operations = useMemo(() => {
    const v = current.curve(n);
    return v < 1 ? 1 : Math.round(v);
  }, [current, n]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {complexities.map((c) => {
          const active = c.id === selected;
          return (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className="group relative px-4 py-2.5 text-sm transition-all duration-200 border"
              style={{
                borderColor: active ? c.color : "#27272a",
                background: active ? `${c.color}15` : "transparent",
                color: active ? c.accent : "#a8a29e",
              }}>
              <span className="font-semibold">{c.name}</span>
              <span className="ml-2 text-xs opacity-60">{c.label}</span>
              {active && <span className="absolute -bottom-px left-0 right-0 h-0.5" style={{ background: c.color }} />}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="border border-stone-800 bg-stone-900/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-800 bg-stone-900/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-stone-500">{current.id}.js</span>
              </div>
              <span className="text-xs" style={{ color: current.color }}>{current.name}</span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              {current.code.map((ln, i) => {
                const isHovered = hoveredLine === i;
                return (
                  <div key={i}
                    className="relative group flex gap-4 px-2 py-0.5 -mx-2 transition-colors"
                    onMouseEnter={() => ln.highlight && setHoveredLine(i)}
                    onMouseLeave={() => setHoveredLine(null)}
                    style={{
                      background: ln.highlight ? `linear-gradient(90deg, ${current.color}22 0%, ${current.color}08 60%, transparent 100%)` : "transparent",
                      borderLeft: ln.highlight ? `2px solid ${current.color}` : "2px solid transparent",
                    }}>
                    <span className="text-stone-600 select-none w-6 text-right shrink-0">{i + 1}</span>
                    <code className="flex-1 whitespace-pre" style={{ color: ln.highlight ? current.accent : "#d6d3d1" }}>{ln.line}</code>
                    {ln.highlight && ln.note && isHovered && (
                      <div className="absolute left-full ml-3 top-0 z-10 px-3 py-1.5 text-xs whitespace-nowrap border pointer-events-none"
                        style={{ background: "#0c0a09", borderColor: current.color, color: current.accent }}>
                        {ln.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-stone-800 px-5 py-3 bg-stone-950/60">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span style={{ color: current.color }}>▸</span>
                <span>Hover highlighted lines to see why they drive the complexity</span>
              </div>
            </div>
          </div>

          <div className="border border-stone-800 bg-stone-900/20 p-5">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-xs tracking-widest uppercase text-stone-500">what's happening</span>
              <span className="flex-1 h-px bg-stone-800" />
            </div>
            <p className="text-stone-300 leading-relaxed text-[15px]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {current.explanation}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="border border-stone-800 bg-stone-900/40 p-5">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs tracking-widest uppercase text-stone-500">live counter</span>
              <span className="text-xs text-stone-600">n = input size</span>
            </div>
            <div className="mb-5">
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-sm text-stone-400">input size</label>
                <span className="text-2xl font-bold tabular-nums" style={{ color: current.accent }}>{n}</span>
              </div>
              <input type="range" min="1" max="64" value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                className="w-full h-1 bg-stone-800 appearance-none cursor-pointer slider" />
              <div className="flex justify-between text-xs text-stone-600 mt-1"><span>1</span><span>64</span></div>
            </div>
            <div className="border-t border-stone-800 pt-4">
              <div className="text-xs text-stone-500 mb-1">estimated operations</div>
              <span className="text-5xl font-bold tabular-nums tracking-tight"
                style={{ color: current.color, fontFamily: "'Fraunces', Georgia, serif" }}>
                {operations.toLocaleString()}
              </span>
              <div className="text-xs text-stone-500 mt-2">for {current.name} with n = {n}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-800">
              <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
                <input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} className="accent-stone-400" />
                <span>compare all curves on chart</span>
              </label>
            </div>
          </div>

          <div className="border p-4" style={{ borderColor: `${current.color}44`, background: `${current.color}08` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2" style={{ background: current.color }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: current.accent }}>{current.label}</span>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">{current.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 border border-stone-800 bg-stone-900/20 p-5">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs tracking-widest uppercase text-stone-500">growth curves</span>
          <span className="text-xs text-stone-600">operations vs. input size</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + t * chartH} y2={PAD.t + t * chartH} stroke="#27272a" strokeDasharray="2 4" />
          ))}
          <line x1={xScale(n)} x2={xScale(n)} y1={PAD.t} y2={H - PAD.b} stroke={current.color} strokeOpacity="0.3" strokeDasharray="3 3" />
          {compareMode && complexities.map((c) => {
            if (c.id === selected) return null;
            return <path key={c.id} d={buildPath(c.curve)} fill="none" stroke={c.color} strokeWidth="1.25" strokeOpacity="0.35" />;
          })}
          <path d={buildPath(current.curve)} fill="none" stroke={current.color} strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 6px ${current.color}66)` }} />
          <circle cx={xScale(n)} cy={yScale(current.curve(n))} r="5" fill={current.color} />
          <circle cx={xScale(n)} cy={yScale(current.curve(n))} r="9" fill="none" stroke={current.color} strokeOpacity="0.4" />
          <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="#44403c" />
          <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke="#44403c" />
          {[1, 16, 32, 48, 64].map((x) => (
            <text key={x} x={xScale(x)} y={H - PAD.b + 18} fill="#78716c" fontSize="10" textAnchor="middle" fontFamily="monospace">{x}</text>
          ))}
          <text x={W / 2} y={H - 4} fill="#57534e" fontSize="10" textAnchor="middle" fontFamily="monospace">n (input size)</text>
          <text x={-H / 2} y={14} fill="#57534e" fontSize="10" textAnchor="middle" fontFamily="monospace" transform="rotate(-90)">operations (log scale)</text>
          {compareMode && (
            <g transform={`translate(${W - PAD.r - 130}, ${PAD.t + 6})`}>
              {complexities.map((c, i) => (
                <g key={c.id} transform={`translate(0, ${i * 14})`}>
                  <rect width="10" height="2" y="4" fill={c.color} opacity={c.id === selected ? 1 : 0.5} />
                  <text x="16" y="8" fill={c.id === selected ? c.accent : "#78716c"} fontSize="9" fontFamily="monospace">{c.name}</text>
                </g>
              ))}
            </g>
          )}
        </svg>
        <div className="mt-2 text-xs text-stone-600 text-center">drag the slider above — watch the highlighted curve accelerate</div>
      </div>
    </>
  );
}

// ============================================================
// PRACTICE MODE
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
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [answeredIds, setAnsweredIds] = useState({});
  const q = activeQuestions[qIndex];

  const poolSize = useMemo(
    () => questions.filter((qq) => selectedTiers.includes(qq.tier)).length,
    [selectedTiers],
  );
  const configColor = tierColors[Math.min(...(selectedTiers.length ? selectedTiers : [1]))] || "#eab308";

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
    setSubmitted(false);
    setQuizStarted(true);
  };

  useEffect(() => {
    setUserAnswer(null);
    setSelectedLines([]);
    setSubmitted(false);
  }, [qIndex]);

  const practiceColor = tierColors[q?.tier] || "#eab308";

  const checkAnswer = () => {
    if (submitted) return;
    let ok = false;
    if (q.type === "multiple_choice" || q.type === "true_false" || q.type === "compare") ok = userAnswer === q.answer;
    else if (q.type === "identify_lines") {
      const su = [...selectedLines].sort((a, b) => a - b);
      const sc = [...q.correctLines].sort((a, b) => a - b);
      ok = su.length === sc.length && su.every((v, i) => v === sc[i]);
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
  };

  const toggleLine = (i) => {
    if (submitted) return;
    setSelectedLines((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  };

  const reset = () => {
    setQIndex(0); setScore({ correct: 0, total: 0 }); setAnsweredIds({});
    setUserAnswer(null); setSelectedLines([]); setSubmitted(false);
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
              {q.type === "identify_lines" ? "click the line(s) that drive the complexity" : "analyze the code"}
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
                  <span className="font-semibold">{opt}</span>
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
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
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
                    <div className="text-2xl font-bold"
                      style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        color: isCorrectOpt ? practiceColor : isWrong ? "#fca5a5" : "#fafaf9",
                      }}>
                      {data.label}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="border border-stone-800 bg-stone-950/60 p-4">
              <div className="text-xs text-stone-500 mb-2">growth comparison (log scale)</div>
              <svg viewBox="0 0 600 140" className="w-full h-auto">
                {[0, 0.5, 1].map((t) => (
                  <line key={t} x1="40" x2="590" y1={10 + t * 110} y2={10 + t * 110} stroke="#27272a" strokeDasharray="2 4" />
                ))}
                {[{ curve: q.optionA.curve, color: "#06b6d4", label: "A" }, { curve: q.optionB.curve, color: "#f97316", label: "B" }].map(({ curve, color, label }) => {
                  const pts = [];
                  const maxVal = Math.max(q.optionA.curve(64), q.optionB.curve(64), 1);
                  for (let x = 0; x <= 64; x++) {
                    const y = curve(x);
                    const yScl = 10 + 110 - (Math.log10(y + 1) / Math.log10(maxVal + 1)) * 110;
                    pts.push(`${40 + (x / 64) * 550},${yScl}`);
                  }
                  return (
                    <g key={label}>
                      <path d={"M" + pts.join(" L")} fill="none" stroke={color} strokeWidth="2" />
                      <text x="595" y="15" fill={color} fontSize="9">{label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
          {!submitted ? (
            <button onClick={checkAnswer}
              disabled={q.type === "identify_lines" ? selectedLines.length === 0 : userAnswer === null}
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
            {score.correct === activeQuestions.length ? "Perfect score. You've got this."
              : score.correct >= activeQuestions.length * 0.75 ? "Solid. A few tricky ones remain — review and try again."
              : score.correct >= activeQuestions.length * 0.5 ? "Halfway there. Revisit the learn mode for the concepts that tripped you up."
              : "Big O takes time. Start with Learn mode, then come back."}
          </div>
          <button onClick={reset} className="px-6 py-2 border text-sm" style={{ borderColor: practiceColor, color: practiceColor }}>new session</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// OPTIMIZE MODE
// Teaches the "O(n\u00b2) \u2192 O(n)" recognition pattern: hashes, frequency
// counters, sliding windows, array buffering.
// ============================================================
const OPTIMIZE_ACCENT = "#14b8a6";
const OPTIMIZE_ACCENT_SOFT = "#5eead4";
const OPTIMIZE_SLOW = "#ef4444";

function formatInt(n) {
  return Math.round(n).toLocaleString();
}

function OptimizeMode() {
  const [index, setIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [solved, setSolved] = useState({});
  const [n, setN] = useState(100);

  const challenge = optimizations[index];

  useEffect(() => {
    setSelectedKey(null);
    setSubmitted(false);
  }, [index]);

  const picked = challenge.options.find((o) => o.key === selectedKey);
  const isCorrect = submitted && picked?.correct;

  const submit = () => {
    if (!selectedKey || submitted) return;
    setSubmitted(true);
    if (picked?.correct) {
      setSolved((s) => ({ ...s, [challenge.id]: true }));
    }
  };

  const slowOps = useMemo(() => {
    const c = challenge.slow.complexity;
    if (c.includes("k")) return Math.round(n * Math.min(n, 16));
    return n * n;
  }, [challenge, n]);
  const fastOps = n;
  const ratio = fastOps > 0 ? slowOps / fastOps : 0;

  const tierAccent = tierColors[challenge.tier] || OPTIMIZE_ACCENT;

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-900/20 p-4 text-sm text-stone-400 leading-relaxed"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        <p>
          Interviews love this pattern: a loop looks innocent, but it's secretly O(n²) because the inner
          step re-scans, re-counts, or rebuilds something. The fix is almost always the same shape — trade
          time for memory with a <em>hash</em>, a <em>frequency map</em>, or a <em>buffered array</em>. Read the
          slow version, name the technique, then watch the operations collapse.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {optimizations.map((c, i) => {
          const active = i === index;
          const done = solved[c.id];
          return (
            <button key={c.id} onClick={() => setIndex(i)}
              className="px-3 py-2 text-sm transition-all border flex items-center gap-2"
              style={{
                borderColor: active ? OPTIMIZE_ACCENT : done ? `${OPTIMIZE_ACCENT}55` : "#27272a",
                background: active ? `${OPTIMIZE_ACCENT}18` : done ? `${OPTIMIZE_ACCENT}06` : "transparent",
                color: active ? OPTIMIZE_ACCENT_SOFT : done ? OPTIMIZE_ACCENT : "#a8a29e",
              }}>
              <span className="w-2 h-2 shrink-0" style={{ background: tierColors[c.tier] }} />
              <span className="font-semibold">{c.title}</span>
              {done && <span className="text-xs opacity-70">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="border border-stone-800 bg-stone-900/40 p-6 md:p-8">
        <div className="flex items-baseline gap-3 mb-1 flex-wrap">
          <span className="text-xs tracking-widest uppercase" style={{ color: tierAccent }}>
            tier 0{challenge.tier}
          </span>
          <span className="text-xs tracking-widest uppercase text-stone-500">optimization</span>
        </div>
        <h2 className="text-2xl md:text-3xl mb-2 text-stone-100"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>
          {challenge.title}
        </h2>
        <p className="text-stone-400 text-sm md:text-base">{challenge.prompt}</p>
      </div>

      <div className={`grid grid-cols-1 ${submitted ? "lg:grid-cols-2" : ""} gap-4`}>
        <CodePanel
          label="slow version"
          accent={OPTIMIZE_SLOW}
          complexity={challenge.slow.complexity}
          code={challenge.slow.code}
          note={challenge.slow.note}
        />
        {submitted && (
          <CodePanel
            label="optimized"
            accent={OPTIMIZE_ACCENT}
            complexity={challenge.fast.complexity}
            code={challenge.fast.code}
            note={challenge.fast.note}
          />
        )}
      </div>

      <div className="border border-stone-800 bg-stone-900/20 p-5">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-xs tracking-widest uppercase text-stone-500">which technique optimizes this?</span>
          <span className="flex-1 h-px bg-stone-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {challenge.options.map((opt) => {
            const isSelected = selectedKey === opt.key;
            const isRight = submitted && opt.correct;
            const isWrong = submitted && isSelected && !opt.correct;
            let bg = "transparent", borderColor = "#292524", textColor = "#d6d3d1";
            if (isRight) { bg = `${OPTIMIZE_ACCENT}18`; borderColor = OPTIMIZE_ACCENT; textColor = OPTIMIZE_ACCENT_SOFT; }
            else if (isWrong) { bg = "#ef444418"; borderColor = "#ef4444"; textColor = "#fca5a5"; }
            else if (isSelected) { bg = "#44403c40"; borderColor = "#78716c"; textColor = "#fafaf9"; }
            return (
              <button key={opt.key}
                onClick={() => !submitted && setSelectedKey(opt.key)}
                disabled={submitted}
                className="text-left px-4 py-3 border transition-all"
                style={{ background: bg, borderColor, color: textColor, cursor: submitted ? "default" : "pointer" }}>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 border flex items-center justify-center text-[10px] shrink-0"
                    style={{ borderColor, background: isRight ? OPTIMIZE_ACCENT : isWrong ? "#ef4444" : "transparent",
                             color: isRight || isWrong ? "#0c0a09" : "transparent" }}>
                    {isRight ? "\u2713" : isWrong ? "\u00d7" : ""}
                  </span>
                  <span className="font-semibold">{opt.label}</span>
                </div>
                {submitted && opt.hint && !opt.correct && (
                  <div className="text-xs text-stone-500 mt-2 pl-7 leading-relaxed">{opt.hint}</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          {!submitted ? (
            <button onClick={submit} disabled={!selectedKey}
              className="px-6 py-3 border font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: OPTIMIZE_ACCENT, background: `${OPTIMIZE_ACCENT}15`, color: OPTIMIZE_ACCENT_SOFT }}>
              Reveal optimization →
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: isCorrect ? OPTIMIZE_ACCENT_SOFT : "#fca5a5" }}>
              {isCorrect ? "\u2713 Correct \u2014 that's the idiomatic fix." : "\u2717 Not quite. See below \u2014 the idiomatic fix is highlighted."}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}
              className="px-4 py-2 text-sm text-stone-400 border border-stone-800 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed">
              ← prev
            </button>
            <button onClick={() => setIndex((i) => Math.min(optimizations.length - 1, i + 1))}
              disabled={index === optimizations.length - 1}
              className="px-4 py-2 text-sm text-stone-400 border border-stone-800 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed">
              next →
            </button>
          </div>
        </div>
      </div>

      {submitted && (
        <>
          <div className="border border-stone-800 bg-stone-900/40 p-5">
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <span className="text-xs tracking-widest uppercase text-stone-500">operation count at n = {n}</span>
              <span className="text-xs text-stone-600">{challenge.slow.complexity} vs {challenge.fast.complexity}</span>
            </div>
            <input type="range" min="10" max="1000" step="10" value={n}
              onChange={(e) => setN(parseInt(e.target.value))}
              className="w-full h-1 bg-stone-800 appearance-none cursor-pointer slider mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border p-4" style={{ borderColor: `${OPTIMIZE_SLOW}44`, background: `${OPTIMIZE_SLOW}08` }}>
                <div className="text-xs tracking-widest uppercase mb-1" style={{ color: OPTIMIZE_SLOW }}>slow</div>
                <div className="text-3xl font-bold tabular-nums" style={{ color: OPTIMIZE_SLOW, fontFamily: "'Fraunces', Georgia, serif" }}>
                  {formatInt(slowOps)}
                </div>
                <div className="text-xs text-stone-500 mt-1">{challenge.slow.complexity} operations</div>
              </div>
              <div className="border p-4" style={{ borderColor: `${OPTIMIZE_ACCENT}44`, background: `${OPTIMIZE_ACCENT}08` }}>
                <div className="text-xs tracking-widest uppercase mb-1" style={{ color: OPTIMIZE_ACCENT }}>optimized</div>
                <div className="text-3xl font-bold tabular-nums" style={{ color: OPTIMIZE_ACCENT_SOFT, fontFamily: "'Fraunces', Georgia, serif" }}>
                  {formatInt(fastOps)}
                </div>
                <div className="text-xs text-stone-500 mt-1">{challenge.fast.complexity} operations</div>
              </div>
              <div className="border border-stone-700 bg-stone-900/60 p-4">
                <div className="text-xs tracking-widest uppercase mb-1 text-stone-500">speedup</div>
                <div className="text-3xl font-bold tabular-nums text-stone-100"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>
                  {ratio >= 10 ? formatInt(ratio) : ratio.toFixed(1)}×
                </div>
                <div className="text-xs text-stone-500 mt-1">fewer operations</div>
              </div>
            </div>
            <div className="mt-4 border border-stone-800 bg-stone-950/60 p-3 overflow-hidden">
              <div className="flex items-center gap-1 h-6">
                <div className="transition-all"
                  style={{ width: "100%", height: "100%", background: `linear-gradient(90deg, ${OPTIMIZE_SLOW}, ${OPTIMIZE_SLOW}44)` }} />
              </div>
              <div className="text-[10px] text-stone-600 mt-0.5">{challenge.slow.complexity} bar</div>
              <div className="flex items-center gap-1 h-6 mt-2">
                <div className="transition-all"
                  style={{ width: `${Math.max(0.5, (fastOps / slowOps) * 100)}%`, height: "100%",
                           background: `linear-gradient(90deg, ${OPTIMIZE_ACCENT}, ${OPTIMIZE_ACCENT}44)` }} />
              </div>
              <div className="text-[10px] text-stone-600 mt-0.5">{challenge.fast.complexity} bar (relative)</div>
            </div>
          </div>

          <div className="border-l-2 pl-5 py-3" style={{ borderColor: OPTIMIZE_ACCENT }}>
            <div className="text-xs tracking-widest uppercase mb-2" style={{ color: OPTIMIZE_ACCENT_SOFT }}>takeaway</div>
            <p className="text-stone-300 leading-relaxed text-[15px]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {challenge.insight}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CodePanel({ label, accent, complexity, code, note }) {
  return (
    <div className="border bg-stone-950/40 overflow-hidden" style={{ borderColor: `${accent}44` }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-stone-900/80"
        style={{ borderColor: `${accent}33` }}>
        <span className="text-xs tracking-widest uppercase" style={{ color: accent }}>{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: accent, fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>
          {complexity}
        </span>
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed">
        {code.map((line, i) => (
          <div key={i} className="flex gap-4 px-1 py-0.5">
            <span className="text-stone-600 select-none w-6 text-right shrink-0">{i + 1}</span>
            <code className="flex-1 whitespace-pre text-stone-300">{line}</code>
          </div>
        ))}
      </div>
      {note && (
        <div className="border-t px-4 py-3 text-xs text-stone-400 leading-relaxed"
          style={{ borderColor: `${accent}22`, background: `${accent}06`, fontFamily: "'Fraunces', Georgia, serif" }}>
          {note}
        </div>
      )}
    </div>
  );
}

// ============================================================
// RACE MODE
// ============================================================
const RACE_SCENARIOS = [
  { id: "search", name: "Search", left: "linearSearch", right: "binarySearch", leftLabel: "Linear Search — O(n)", rightLabel: "Binary Search — O(log n)", leftColor: "#ef4444", rightColor: "#06b6d4" },
  { id: "sort", name: "Sort", left: "bubbleSort", right: "mergeSort", leftLabel: "Bubble Sort — O(n\u00b2)", rightLabel: "Merge Sort — O(n log n)", leftColor: "#ef4444", rightColor: "#f97316" },
];

function RaceMode() {
  const [scenario, setScenario] = useState("search");
  const [size, setSize] = useState(32);
  const [speed, setSpeed] = useState(5);
  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(1);

  const cfg = RACE_SCENARIOS.find((s) => s.id === scenario);

  const baseArray = useMemo(() => {
    const arr = [];
    let s = seed * 9301 + 49297;
    for (let i = 0; i < size; i++) {
      s = (s * 9301 + 49297) % 233280;
      arr.push(1 + Math.floor((s / 233280) * size));
    }
    return arr;
  }, [size, seed]);

  const sortedArray = useMemo(() => [...baseArray].sort((a, b) => a - b), [baseArray]);
  const target = useMemo(() => sortedArray[Math.floor(size * 0.85)], [sortedArray, size]);

  const buildTrace = (algo) => {
    const trace = [];
    if (algo === "linearSearch") {
      const arr = baseArray;
      for (let i = 0; i < arr.length; i++) {
        trace.push({ highlight: [i], done: false, arr: [...arr] });
        if (arr[i] === target) {
          trace.push({ highlight: [i], done: true, arr: [...arr] });
          return trace;
        }
      }
      trace.push({ highlight: [], done: true, arr: [...arr] });
      return trace;
    }
    if (algo === "binarySearch") {
      const arr = [...sortedArray];
      let lo = 0, hi = arr.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        trace.push({ highlight: [mid], range: [lo, hi], done: false, arr: [...arr] });
        if (arr[mid] === target) {
          trace.push({ highlight: [mid], range: [lo, hi], done: true, arr: [...arr] });
          return trace;
        }
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
      }
      trace.push({ highlight: [], done: true, arr: [...arr] });
      return trace;
    }
    if (algo === "bubbleSort") {
      const arr = [...baseArray];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          trace.push({ highlight: [j, j + 1], done: false, arr: [...arr] });
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            trace.push({ highlight: [j, j + 1], done: false, arr: [...arr] });
          }
        }
      }
      trace.push({ highlight: [], done: true, arr: [...arr] });
      return trace;
    }
    if (algo === "mergeSort") {
      const arr = [...baseArray];
      const working = [...arr];
      const steps = [];
      const ms = (lo, hi) => {
        if (hi - lo <= 1) return;
        const mid = (lo + hi) >> 1;
        ms(lo, mid);
        ms(mid, hi);
        const merged = [];
        let i = lo, j = mid;
        while (i < mid && j < hi) {
          if (working[i] <= working[j]) { merged.push(working[i]); i++; }
          else { merged.push(working[j]); j++; }
          steps.push({ range: [lo, hi] });
        }
        while (i < mid) { merged.push(working[i]); i++; steps.push({ range: [lo, hi] }); }
        while (j < hi) { merged.push(working[j]); j++; steps.push({ range: [lo, hi] }); }
        for (let k = 0; k < merged.length; k++) working[lo + k] = merged[k];
        steps.push({ range: [lo, hi], snapshot: [...working] });
      };
      ms(0, arr.length);
      let current = [...arr];
      steps.forEach((s) => {
        if (s.snapshot) current = s.snapshot;
        trace.push({ range: s.range, highlight: [], done: false, arr: [...current] });
      });
      trace.push({ highlight: [], done: true, arr: [...current] });
      return trace;
    }
    return [];
  };

  const leftTrace = useMemo(() => buildTrace(cfg.left), [cfg.left, baseArray, sortedArray, target]);
  const rightTrace = useMemo(() => buildTrace(cfg.right), [cfg.right, baseArray, sortedArray, target]);

  const [leftState, setLeftState] = useState({ step: 0, ops: 0, done: false, highlight: [], arr: [] });
  const [rightState, setRightState] = useState({ step: 0, ops: 0, done: false, highlight: [], arr: [] });

  useEffect(() => {
    setLeftState({ step: 0, ops: 0, done: false, highlight: [], arr: leftTrace[0]?.arr || [] });
    setRightState({ step: 0, ops: 0, done: false, highlight: [], arr: rightTrace[0]?.arr || [] });
    setRunning(false);
  }, [scenario, seed, size]);

  useEffect(() => {
    if (!running) return;
    const interval = Math.max(10, 320 - speed * 30);
    const id = setInterval(() => {
      setLeftState((s) => {
        if (s.done || s.step >= leftTrace.length) return s;
        const frame = leftTrace[s.step];
        const nextDone = frame.done;
        return { step: s.step + 1, ops: s.ops + 1, highlight: frame.highlight || [], arr: frame.arr, done: nextDone, range: frame.range };
      });
      setRightState((s) => {
        if (s.done || s.step >= rightTrace.length) return s;
        const frame = rightTrace[s.step];
        const nextDone = frame.done;
        return { step: s.step + 1, ops: s.ops + 1, highlight: frame.highlight || [], arr: frame.arr, done: nextDone, range: frame.range };
      });
    }, interval);
    return () => clearInterval(id);
  }, [running, speed, leftTrace, rightTrace]);

  useEffect(() => {
    if (leftState.done && rightState.done) setRunning(false);
  }, [leftState.done, rightState.done]);

  const reset = () => setSeed(seed + 1);
  const startOrPause = () => {
    if (leftState.done && rightState.done) {
      setLeftState({ step: 0, ops: 0, done: false, highlight: [], arr: leftTrace[0]?.arr || [] });
      setRightState({ step: 0, ops: 0, done: false, highlight: [], arr: rightTrace[0]?.arr || [] });
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  };

  const maxVal = Math.max(...baseArray, 1);
  const winner = leftState.done && rightState.done
    ? (leftState.ops < rightState.ops ? "left" : leftState.ops > rightState.ops ? "right" : "tie")
    : null;

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-900/40 p-5">
        <div className="flex flex-wrap gap-6 items-start">
          <div>
            <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">scenario</div>
            <div className="flex gap-2">
              {RACE_SCENARIOS.map((s) => (
                <button key={s.id} onClick={() => setScenario(s.id)}
                  className="px-4 py-2 border text-sm transition-all"
                  style={{
                    borderColor: scenario === s.id ? "#f97316" : "#27272a",
                    background: scenario === s.id ? "#f9731615" : "transparent",
                    color: scenario === s.id ? "#fdba74" : "#a8a29e",
                  }}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[180px]">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs tracking-widest uppercase text-stone-500">array size</span>
              <span className="text-lg font-bold text-stone-200 tabular-nums">{size}</span>
            </div>
            <input type="range" min="8" max={scenario === "sort" ? 48 : 128} value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full h-1 bg-stone-800 appearance-none cursor-pointer slider" disabled={running} />
          </div>

          <div className="flex-1 min-w-[180px]">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs tracking-widest uppercase text-stone-500">speed</span>
              <span className="text-lg font-bold text-stone-200 tabular-nums">{speed}</span>
            </div>
            <input type="range" min="1" max="10" value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full h-1 bg-stone-800 appearance-none cursor-pointer slider" />
          </div>

          <div className="flex gap-2 self-end">
            <button onClick={startOrPause}
              className="px-5 py-2 border font-semibold text-sm"
              style={{ borderColor: "#f97316", background: "#f9731615", color: "#fdba74" }}>
              {running ? "⏸ pause" : leftState.done && rightState.done ? "↻ restart" : leftState.step > 0 ? "▶ resume" : "▶ start"}
            </button>
            <button onClick={reset}
              className="px-4 py-2 text-sm text-stone-400 border border-stone-800 hover:bg-stone-900">
              new array
            </button>
          </div>
        </div>
        {scenario === "search" && (
          <div className="mt-3 text-xs text-stone-500">
            searching for value <span className="text-stone-200 font-bold">{target}</span>
            <span className="text-stone-700"> · linear scans left-to-right · binary halves the sorted range</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RaceTrack
          title={cfg.leftLabel} color={cfg.leftColor} state={leftState} maxVal={maxVal}
          isWinner={winner === "left"} isLoser={winner === "right"}
        />
        <RaceTrack
          title={cfg.rightLabel} color={cfg.rightColor} state={rightState} maxVal={maxVal}
          isWinner={winner === "right"} isLoser={winner === "left"}
        />
      </div>

      {winner && (
        <div className="border-2 p-5 text-center" style={{
          borderColor: winner === "left" ? cfg.leftColor : winner === "right" ? cfg.rightColor : "#57534e",
          background: winner === "left" ? `${cfg.leftColor}08` : winner === "right" ? `${cfg.rightColor}08` : "#1c191740",
        }}>
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">result</div>
          {winner === "tie" ? (
            <div className="text-stone-300">A tie. Try a different array size.</div>
          ) : (
            <>
              <div className="text-xl mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: winner === "left" ? cfg.leftColor : cfg.rightColor }}>
                <em>{winner === "left" ? cfg.leftLabel.split(" — ")[0] : cfg.rightLabel.split(" — ")[0]} wins</em>
              </div>
              <div className="text-sm text-stone-400">
                {leftState.ops} operations vs {rightState.ops} operations
                <span className="text-stone-600">
                  {" "}· {(Math.max(leftState.ops, rightState.ops) / Math.max(1, Math.min(leftState.ops, rightState.ops))).toFixed(1)}× difference
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="border border-stone-800 bg-stone-900/20 p-4 text-sm text-stone-400 leading-relaxed"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        {scenario === "search" ? (
          <p>
            Linear search checks each element from left to right. Binary search — which requires a sorted array —
            cuts the range in half each step. The gap between O(n) and O(log n) widens dramatically as the array grows.
            Try size 128 to see just how lopsided the race gets.
          </p>
        ) : (
          <p>
            Bubble sort compares and swaps neighbors, making n passes over n elements — roughly n² operations.
            Merge sort recursively splits then merges, giving log n levels of n work — n log n total.
            At n = 32, bubble does ~1000 ops while merge does ~160. Scale to 48 and the gap becomes absurd.
          </p>
        )}
      </div>
    </div>
  );
}

function RaceTrack({ title, color, state, maxVal, isWinner, isLoser }) {
  const { arr = [], highlight = [], range, ops = 0, done } = state;
  return (
    <div className="border bg-stone-900/20 p-4 transition-all"
      style={{
        borderColor: isWinner ? color : "#292524",
        boxShadow: isWinner ? `0 0 20px ${color}33` : "none",
        opacity: isLoser ? 0.75 : 1,
      }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2" style={{ background: color }} />
          <span className="text-sm font-semibold text-stone-200">{title}</span>
        </div>
        <div className="text-xs text-stone-500">
          ops: <span className="font-bold tabular-nums" style={{ color }}>{ops}</span>
          {done && <span className="ml-2" style={{ color }}>✓</span>}
        </div>
      </div>
      <div className="flex items-end gap-[2px] h-32 bg-stone-950/40 p-2">
        {arr.map((v, i) => {
          const isHL = highlight.includes(i);
          const inRange = range && i >= range[0] && i <= range[1];
          const bg = isHL ? color : inRange ? `${color}44` : "#44403c";
          return (
            <div key={i} className="flex-1 transition-all duration-100"
              style={{
                height: `${(v / maxVal) * 100}%`,
                background: bg,
                minHeight: "2px",
                boxShadow: isHL ? `0 0 8px ${color}` : "none",
              }} />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// CASES MODE
// ============================================================
function CasesMode() {
  const [selectedId, setSelectedId] = useState("quicksort");
  const algo = algorithmCases.find((a) => a.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-900/20 p-4 text-sm text-stone-400 leading-relaxed"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        <p>
          Most algorithms don't have a single complexity — they have three. The <em>best case</em> is the luckiest
          possible input; the <em>worst case</em> is the most pathological; the <em>average case</em> is what you
          actually get most of the time. When people say an algorithm is "O(n log n)," they usually mean the
          average case. The worst case can be surprisingly bad.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {algorithmCases.map((a) => {
          const active = selectedId === a.id;
          return (
            <button key={a.id} onClick={() => setSelectedId(a.id)}
              className="px-4 py-2 text-sm transition-all border"
              style={{
                borderColor: active ? "#a855f7" : "#27272a",
                background: active ? "#a855f715" : "transparent",
                color: active ? "#d8b4fe" : "#a8a29e",
              }}>
              {a.name}
            </button>
          );
        })}
      </div>

      <div className="border border-stone-800 bg-stone-900/40 p-5">
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">algorithm</div>
        <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          {algo.name}
        </h3>
        <p className="text-stone-400 text-sm">{algo.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["best", "average", "worst"].map((key) => {
          const c = algo[key];
          return (
            <div key={key} className="border p-5"
              style={{ borderColor: `${c.color}44`, background: `${c.color}08` }}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="w-2 h-2" style={{ background: c.color }} />
                <span className="text-xs tracking-widest uppercase" style={{ color: c.color }}>{c.label}</span>
              </div>
              <div className="text-3xl font-bold mb-3 tabular-nums"
                style={{ fontFamily: "'Fraunces', Georgia, serif", color: c.color, fontStyle: "italic" }}>
                {c.complexity}
              </div>
              <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">when</div>
              <p className="text-sm text-stone-300 leading-relaxed">{c.when}</p>
            </div>
          );
        })}
      </div>

      <div className="border-l-2 pl-5 py-3" style={{ borderColor: "#a855f7" }}>
        <div className="text-xs tracking-widest uppercase mb-2" style={{ color: "#a855f7" }}>insight</div>
        <p className="text-stone-300 leading-relaxed" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          {algo.insight}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// CHEATSHEET MODE
// ============================================================
function CheatsheetMode() {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedStruct, setSelectedStruct] = useState(null);

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-900/20 p-4 text-sm text-stone-400 leading-relaxed"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        <p>
          A quick reference for the complexities of common operations across common data structures.
          Hover a cell to see the reasoning, or click a structure's name for the full breakdown.
          Colors indicate complexity class — green is fast, red is slow.
        </p>
      </div>

      <div className="border border-stone-800 bg-stone-900/20 overflow-x-auto">
        <table className="w-full text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <thead>
            <tr className="border-b border-stone-800">
              <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-stone-500 font-normal">structure</th>
              {opColumns.map((col) => (
                <th key={col.key} className="text-center px-3 py-3 text-xs tracking-widest uppercase text-stone-500 font-normal">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataStructures.map((ds) => (
              <tr key={ds.id} className="border-b border-stone-900 hover:bg-stone-900/30 transition-colors">
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedStruct(selectedStruct === ds.id ? null : ds.id)}
                    className="text-left w-full">
                    <div className="font-semibold text-stone-200 text-sm">{ds.name}</div>
                    <div className="text-xs text-stone-600 mt-0.5">{ds.description.slice(0, 56)}…</div>
                  </button>
                </td>
                {opColumns.map((col) => {
                  const op = ds.ops[col.key];
                  const isHovered = hoveredCell === `${ds.id}:${col.key}`;
                  const tint = complexityTint(op.c);
                  return (
                    <td key={col.key} className="px-2 py-2 text-center"
                      onMouseEnter={() => setHoveredCell(`${ds.id}:${col.key}`)}
                      onMouseLeave={() => setHoveredCell(null)}>
                      <div className="px-3 py-2 border font-semibold transition-all cursor-default relative"
                        style={{
                          borderColor: isHovered ? tint : `${tint}44`,
                          background: isHovered ? `${tint}22` : `${tint}08`,
                          color: tint,
                        }}>
                        {op.c}
                        {isHovered && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-64 px-3 py-2 border text-xs text-left"
                            style={{ background: "#0c0a09", borderColor: tint, color: "#d6d3d1" }}>
                            <div className="text-stone-500 uppercase tracking-widest mb-1" style={{ fontSize: "9px" }}>
                              {ds.name} · {col.label}
                            </div>
                            {op.note}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { c: "O(1)", label: "constant" },
          { c: "O(log n)", label: "logarithmic" },
          { c: "O(n)", label: "linear" },
          { c: "O(n log n)", label: "linearithmic" },
          { c: "O(n\u00b2)", label: "quadratic" },
        ].map((l) => (
          <div key={l.c} className="flex items-center gap-2 px-3 py-1.5 border"
            style={{ borderColor: `${complexityTint(l.c)}44`, background: `${complexityTint(l.c)}08` }}>
            <span className="w-2 h-2" style={{ background: complexityTint(l.c) }} />
            <span style={{ color: complexityTint(l.c) }} className="font-semibold">{l.c}</span>
            <span className="text-stone-500">{l.label}</span>
          </div>
        ))}
      </div>

      {selectedStruct && (() => {
        const ds = dataStructures.find((d) => d.id === selectedStruct);
        return (
          <div className="border-2 border-stone-700 bg-stone-900/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {ds.name}
              </h3>
              <button onClick={() => setSelectedStruct(null)} className="text-stone-500 hover:text-stone-200 text-lg">×</button>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed mb-4" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {ds.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {opColumns.map((col) => {
                const op = ds.ops[col.key];
                const tint = complexityTint(op.c);
                return (
                  <div key={col.key} className="p-3 border"
                    style={{ borderColor: `${tint}44`, background: `${tint}05` }}>
                    <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">{col.label}</div>
                    <div className="font-bold mb-1" style={{ color: tint }}>{op.c}</div>
                    <div className="text-xs text-stone-400 leading-snug">{op.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
