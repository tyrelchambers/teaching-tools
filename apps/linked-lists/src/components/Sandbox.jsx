import { useEffect, useMemo, useState } from "react";
import LinkedListDiagram from "./LinkedListDiagram.jsx";
import { makeNode } from "../lib/linkedList.js";

function buildSinglyState(values) {
  const nodes = values.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  return {
    nodes,
    head: nodes[0] ?? null,
    listType: "singly",
    pointers: { head: nodes[0] ?? null },
    caption: nodes.length ? "Loaded list." : "Empty list.",
  };
}

function frameFromState(state) {
  const { nodes, listType, pointers, caption } = state;
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      value: n.value,
      nextId: n.next ? n.next.id : null,
      prevId: n.prev ? n.prev.id : null,
    })),
    order: nodes.map((n) => n.id),
    pointers: Object.fromEntries(
      Object.entries(pointers).map(([k, v]) => [k, v ? v.id : null]),
    ),
    listType,
    line: null,
    caption,
  };
}

function ActionBtn({ onClick, disabled, children, accent, primary = false, title }) {
  const baseStyle = primary
    ? { background: `${accent}15`, border: `1px solid ${accent}`, color: accent }
    : { background: "transparent", border: "1px solid #292524", color: "#a8a29e" };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="px-3 py-1.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={baseStyle}
      onMouseEnter={(e) => {
        if (disabled || primary) return;
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.color = "#fafaf9";
      }}
      onMouseLeave={(e) => {
        if (disabled || primary) return;
        e.currentTarget.style.borderColor = "#292524";
        e.currentTarget.style.color = "#a8a29e";
      }}
    >
      {children}
    </button>
  );
}

function NumInput({ value, onChange, placeholder, width = "w-20" }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={
        "px-2 py-1 bg-stone-950 border border-stone-800 text-stone-200 text-sm focus:outline-none focus:border-stone-600 " +
        width
      }
    />
  );
}

function PanelSection({ label, children }) {
  return (
    <div className="border border-stone-800 bg-stone-950 p-4 space-y-3">
      <div className="text-stone-500 text-[10px] uppercase tracking-widest">{label}</div>
      {children}
    </div>
  );
}

export default function Sandbox({ seed, accent = "#06b6d4" }) {
  const [state, setState] = useState(() => buildSinglyState([1, 2, 3, 4, 5]));
  const [insertValue, setInsertValue] = useState("9");
  const [insertIndex, setInsertIndex] = useState("1");
  const [deleteIndex, setDeleteIndex] = useState("0");
  const [cycleAt, setCycleAt] = useState("1");
  const [loadText, setLoadText] = useState("1, 2, 3, 4, 5");

  useEffect(() => {
    if (!seed || !Array.isArray(seed.values)) return;
    setState(buildSinglyState(seed.values));
    setLoadText(seed.values.join(", "));
  }, [seed]);

  const frame = useMemo(() => frameFromState(state), [state]);

  function load() {
    const parsed = loadText
      .split(/[,\s]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n));
    setState(buildSinglyState(parsed));
  }

  function insertAtHead() {
    const v = Number(insertValue);
    if (!Number.isFinite(v)) return;
    setState((s) => {
      const node = makeNode(v);
      node.next = s.head;
      const nodes = [node, ...s.nodes];
      return {
        ...s,
        nodes,
        head: node,
        pointers: { head: node, curr: node },
        caption: `Inserted ${v} at head — O(1).`,
      };
    });
  }

  function insertAtTail() {
    const v = Number(insertValue);
    if (!Number.isFinite(v)) return;
    setState((s) => {
      const node = makeNode(v);
      if (!s.head) {
        return {
          ...s,
          nodes: [node],
          head: node,
          pointers: { head: node, curr: node },
          caption: `Inserted ${v} at tail (was empty).`,
        };
      }
      let curr = s.head;
      while (curr.next) curr = curr.next;
      curr.next = node;
      return {
        ...s,
        nodes: [...s.nodes, node],
        pointers: { head: s.head, curr: node },
        caption: `Inserted ${v} at tail — O(n) walk to find tail.`,
      };
    });
  }

  function insertAtIndex() {
    const v = Number(insertValue);
    const idx = Number(insertIndex);
    if (!Number.isFinite(v) || !Number.isFinite(idx) || idx < 0) return;
    setState((s) => {
      const node = makeNode(v);
      if (idx === 0) {
        node.next = s.head;
        return {
          ...s,
          nodes: [node, ...s.nodes],
          head: node,
          pointers: { head: node, curr: node },
          caption: `Inserted ${v} at index 0.`,
        };
      }
      let prev = s.head;
      for (let i = 0; i < idx - 1 && prev?.next; i++) prev = prev.next;
      if (!prev) {
        return { ...s, caption: `Index ${idx} out of range.` };
      }
      node.next = prev.next;
      prev.next = node;
      const nodes = [...s.nodes];
      const insertAt = nodes.indexOf(prev) + 1;
      nodes.splice(insertAt, 0, node);
      return {
        ...s,
        nodes,
        pointers: { head: s.head, prev, curr: node },
        caption: `Inserted ${v} at index ${idx} — O(n) walk to find prev.`,
      };
    });
  }

  function deleteAtIndex() {
    const idx = Number(deleteIndex);
    if (!Number.isFinite(idx) || idx < 0) return;
    setState((s) => {
      if (!s.head) return { ...s, caption: "List is empty." };
      if (idx === 0) {
        const removed = s.head;
        const nodes = s.nodes.filter((n) => n !== removed);
        return {
          ...s,
          nodes,
          head: removed.next,
          pointers: { head: removed.next },
          caption: `Removed head (${removed.value}).`,
        };
      }
      let prev = s.head;
      for (let i = 0; i < idx - 1 && prev?.next; i++) prev = prev.next;
      if (!prev || !prev.next) return { ...s, caption: `Index ${idx} out of range.` };
      const removed = prev.next;
      prev.next = removed.next;
      const nodes = s.nodes.filter((n) => n !== removed);
      return {
        ...s,
        nodes,
        pointers: { head: s.head, prev },
        caption: `Removed index ${idx} (${removed.value}).`,
      };
    });
  }

  function reverse() {
    setState((s) => {
      let prev = null;
      let curr = s.head;
      while (curr) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
      }
      const nodes = [...s.nodes].reverse();
      return {
        ...s,
        nodes,
        head: prev,
        pointers: { head: prev },
        caption: "Reversed in place — O(n) time, O(1) space.",
      };
    });
  }

  function findMiddle() {
    setState((s) => {
      let slow = s.head;
      let fast = s.head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
      }
      return {
        ...s,
        pointers: { head: s.head, slow, fast },
        caption: slow ? `Middle = ${slow.value}.` : "List is empty.",
      };
    });
  }

  function detectCycle() {
    setState((s) => {
      let slow = s.head;
      let fast = s.head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
          let entry = s.head;
          while (entry !== slow) {
            entry = entry.next;
            slow = slow.next;
          }
          return {
            ...s,
            pointers: { head: s.head, cycleStart: entry, meet: fast },
            caption: `Cycle detected. Enters at ${entry.value}.`,
          };
        }
      }
      return {
        ...s,
        pointers: { head: s.head },
        caption: "No cycle.",
      };
    });
  }

  function makeCycle() {
    const idx = Number(cycleAt);
    if (!Number.isFinite(idx) || idx < 0) return;
    setState((s) => {
      if (s.nodes.length === 0) return s;
      const target = s.nodes[Math.min(idx, s.nodes.length - 1)];
      const last = s.nodes[s.nodes.length - 1];
      last.next = target;
      return {
        ...s,
        pointers: { head: s.head, cycleStart: target },
        caption: `Made tail point at index ${idx} (${target.value}).`,
      };
    });
  }

  function clearPointers() {
    setState((s) => ({ ...s, pointers: { head: s.head } }));
  }

  function reset() {
    setState(buildSinglyState([1, 2, 3, 4, 5]));
    setLoadText("1, 2, 3, 4, 5");
  }

  return (
    <div className="border border-stone-800 bg-stone-900/40 p-6 md:p-8 space-y-5">
      <header>
        <div className="text-xs tracking-widest uppercase text-stone-500 mb-1">free-form playground</div>
        <h2
          className="text-2xl md:text-3xl text-stone-100 mb-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}
        >
          Sandbox
        </h2>
        <p className="text-stone-400 mt-1.5 leading-relaxed text-sm max-w-3xl">
          Mutate the list directly with the controls below — the diagram updates live. Pointer chips persist
          after queries (find middle, detect cycle) so you can inspect the result.
        </p>
      </header>

      <LinkedListDiagram frame={frame} />

      <div className="flex flex-wrap items-center gap-2 p-3 border border-stone-800 bg-stone-950">
        <span className="text-stone-500 text-[10px] uppercase tracking-widest pr-1">load</span>
        <input
          type="text"
          value={loadText}
          onChange={(e) => setLoadText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") load();
          }}
          className="px-3 py-1.5 bg-stone-950 border border-stone-800 text-stone-200 text-sm focus:outline-none focus:border-stone-600 w-72"
          placeholder="1, 2, 3, 4, 5"
        />
        <ActionBtn onClick={load} accent={accent} primary>load</ActionBtn>
        <span className="grow" />
        <ActionBtn onClick={clearPointers} accent={accent}>clear pointers</ActionBtn>
        <ActionBtn onClick={reset} accent={accent}>reset</ActionBtn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PanelSection label="insert">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-stone-500">value</span>
            <NumInput value={insertValue} onChange={setInsertValue} />
            <ActionBtn onClick={insertAtHead} accent={accent}>at head</ActionBtn>
            <ActionBtn onClick={insertAtTail} accent={accent}>at tail</ActionBtn>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-stone-500">at index</span>
            <NumInput value={insertIndex} onChange={setInsertIndex} />
            <ActionBtn onClick={insertAtIndex} accent={accent}>insert</ActionBtn>
          </div>
        </PanelSection>

        <PanelSection label="delete">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-stone-500">at index</span>
            <NumInput value={deleteIndex} onChange={setDeleteIndex} />
            <ActionBtn onClick={deleteAtIndex} accent={accent}>delete</ActionBtn>
          </div>
        </PanelSection>

        <PanelSection label="transform">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <ActionBtn onClick={reverse} accent={accent}>reverse</ActionBtn>
          </div>
        </PanelSection>

        <PanelSection label="query / cycle">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <ActionBtn onClick={findMiddle} accent={accent}>find middle</ActionBtn>
            <ActionBtn onClick={detectCycle} accent={accent}>detect cycle</ActionBtn>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-stone-500">make cycle to index</span>
            <NumInput value={cycleAt} onChange={setCycleAt} />
            <ActionBtn onClick={makeCycle} accent={accent}>create</ActionBtn>
          </div>
        </PanelSection>
      </div>

      <p className="text-stone-500 text-xs">
        Note: cycle creation is one-way. Use <span className="text-stone-300">reset</span> or{" "}
        <span className="text-stone-300">load</span> to clear it.
      </p>
    </div>
  );
}
