// Renders a single trace frame as an SVG linked-list diagram with animated
// pointer chips. Nodes keep their id-based React key across frames so CSS
// transitions on `transform` produce smooth movement when the list reorders.

const NODE_W = 88;
const NODE_H = 56;
const GAP_X = 56;
const ROW_H = 168;
const PAD_X = 32;
const PAD_TOP = 88;
const PAD_BOTTOM = 36;

const POINTER_COLORS = {
  head: "#10b981",
  tail: "#0ea5e9",
  dummy: "#f59e0b",
  slow: "#a855f7",
  fast: "#ec4899",
  prev: "#94a3b8",
  curr: "#10b981",
  next: "#fbbf24",
  nextNode: "#fbbf24",
  p1: "#a855f7",
  p2: "#ec4899",
  result: "#10b981",
  resultTail: "#0ea5e9",
  meet: "#f43f5e",
  cycleStart: "#f43f5e",
  carry: "#f59e0b",
  left: "#a855f7",
  right: "#ec4899",
};

function pointerColor(name) {
  return POINTER_COLORS[name] ?? "#a8a29e";
}

// Rough wrapping layout: pack nodes left-to-right; wrap when row gets wide.
function layoutPositions(order, maxWidthPx) {
  const perRow = Math.max(1, Math.floor((maxWidthPx - PAD_X * 2 + GAP_X) / (NODE_W + GAP_X)));
  const positions = new Map();
  order.forEach((id, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    positions.set(id, {
      x: PAD_X + col * (NODE_W + GAP_X),
      y: PAD_TOP + row * ROW_H,
      row,
      col,
    });
  });
  const rowsUsed = Math.ceil(order.length / perRow) || 1;
  const widthUsed = PAD_X * 2 + Math.min(order.length, perRow) * NODE_W + Math.max(0, Math.min(order.length, perRow) - 1) * GAP_X;
  return { positions, rowsUsed, perRow, widthUsed };
}

function PointerChip({ name, x, y, stackIndex }) {
  const yOffset = -36 - stackIndex * 26;
  const color = pointerColor(name);
  return (
    <g
      style={{
        transform: `translate(${x}px, ${y + yOffset}px)`,
        transition: "transform 320ms cubic-bezier(0.4, 0.0, 0.2, 1)",
      }}
    >
      <rect
        x={0}
        y={0}
        width={NODE_W}
        height={20}
        rx={10}
        ry={10}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={NODE_W / 2}
        y={14}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize={11}
        fontWeight={600}
        fill={color}
      >
        {name}
      </text>
      <line x1={NODE_W / 2} y1={20} x2={NODE_W / 2} y2={32} stroke={color} strokeWidth={1.5} />
      <polygon
        points={`${NODE_W / 2 - 4},32 ${NODE_W / 2 + 4},32 ${NODE_W / 2},38`}
        fill={color}
      />
    </g>
  );
}

function NodeBox({ node, position, highlighted }) {
  const stroke = highlighted ? "#10b981" : "#44403c";
  const fill = highlighted ? "rgba(16, 185, 129, 0.08)" : "#1c1917";
  return (
    <g
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 320ms cubic-bezier(0.4, 0.0, 0.2, 1)",
      }}
    >
      <rect
        x={0}
        y={0}
        width={NODE_W}
        height={NODE_H}
        rx={6}
        ry={6}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={NODE_W / 2}
        y={NODE_H / 2 + 6}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize={18}
        fontWeight={500}
        fill="#e7e5e4"
      >
        {String(node.value)}
      </text>
    </g>
  );
}

function arrowPath(from, to, listType) {
  const sameRow = from.row === to.row;
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_H / 2;

  if (sameRow && to.col === from.col + 1) {
    return `M ${x1} ${y1} L ${x2 - 6} ${y2}`;
  }
  // Curve for wrapping or backwards arrows (cycles, doubly-back arrows)
  const midX = (x1 + x2) / 2;
  const midY = Math.min(y1, y2) - 28;
  return `M ${x1} ${y1} Q ${midX} ${midY} ${x2 - 6} ${y2}`;
}

function selfArrow(from) {
  // For circular tail→head when there's only one node (self-loop)
  const cx = from.x + NODE_W / 2;
  const cy = from.y;
  return `M ${cx + 12} ${cy} A 22 22 0 1 1 ${cx - 12} ${cy}`;
}

function NullTerminator({ position }) {
  const x = position.x + NODE_W + 14;
  const y = position.y + NODE_H / 2;
  return (
    <g>
      <line x1={position.x + NODE_W} y1={y} x2={x} y2={y} stroke="#57534e" strokeWidth={1.5} />
      <text
        x={x + 4}
        y={y + 5}
        fontFamily="JetBrains Mono, monospace"
        fontSize={13}
        fill="#78716c"
      >
        ∅
      </text>
    </g>
  );
}

export default function LinkedListDiagram({ frame, height, maxWidth = 980 }) {
  if (!frame) {
    return (
      <div className="flex items-center justify-center text-stone-500 italic text-sm" style={{ height: height ?? 220 }}>
        no frame
      </div>
    );
  }
  const { nodes, order, pointers, listType, caption } = frame;
  const { positions, rowsUsed, widthUsed } = layoutPositions(order, maxWidth);
  const svgWidth = Math.max(maxWidth, widthUsed);
  const svgHeight = PAD_TOP + rowsUsed * ROW_H - (ROW_H - NODE_H) + PAD_BOTTOM;

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  // Group pointers by target node so chips stack instead of overlap.
  const pointersByTarget = new Map();
  for (const [name, targetId] of Object.entries(pointers)) {
    if (!targetId || !positions.has(targetId)) continue;
    if (!pointersByTarget.has(targetId)) pointersByTarget.set(targetId, []);
    pointersByTarget.get(targetId).push(name);
  }

  // Highlight the node currently held by a "primary" pointer (curr / slow / etc.)
  const HIGHLIGHT_PRIORITY = ["curr", "slow", "p1", "left", "head"];
  const highlightedId = HIGHLIGHT_PRIORITY.map((k) => pointers[k]).find(Boolean) ?? null;

  // Arrows: forward (next) and, for doubly, backward (prev).
  const forwardArrows = [];
  const backwardArrows = [];
  for (const node of nodes) {
    const fromPos = positions.get(node.id);
    if (!fromPos) continue;
    if (node.nextId && positions.has(node.nextId)) {
      const toPos = positions.get(node.nextId);
      if (node.id === node.nextId) {
        forwardArrows.push({ key: `f-${node.id}`, d: selfArrow(fromPos), curved: true });
      } else {
        forwardArrows.push({ key: `f-${node.id}`, d: arrowPath(fromPos, toPos, listType), curved: fromPos.row !== toPos.row || toPos.col !== fromPos.col + 1 });
      }
    } else if (listType !== "circular") {
      forwardArrows.push({ key: `f-${node.id}-null`, terminator: true, position: fromPos });
    }
    if (listType === "doubly" && node.prevId && positions.has(node.prevId)) {
      const toPos = positions.get(node.prevId);
      backwardArrows.push({
        key: `b-${node.id}`,
        d: `M ${fromPos.x} ${fromPos.y + NODE_H / 2 - 6} Q ${(fromPos.x + toPos.x + NODE_W) / 2} ${Math.min(fromPos.y, toPos.y) - 18} ${toPos.x + NODE_W + 6} ${toPos.y + NODE_H / 2 - 6}`,
      });
    }
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-stone-800 bg-stone-950">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height={height ?? svgHeight}
          preserveAspectRatio="xMinYMid meet"
          style={{ display: "block", minHeight: 200 }}
        >
          <defs>
            <marker id="arrowhead-fwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a8a29e" />
            </marker>
            <marker id="arrowhead-back" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#737373" />
            </marker>
          </defs>

          {forwardArrows.map((a) =>
            a.terminator ? (
              <NullTerminator key={a.key} position={a.position} />
            ) : (
              <path
                key={a.key}
                d={a.d}
                stroke="#a8a29e"
                strokeWidth={1.5}
                fill="none"
                markerEnd="url(#arrowhead-fwd)"
              />
            ),
          )}

          {backwardArrows.map((a) => (
            <path
              key={a.key}
              d={a.d}
              stroke="#737373"
              strokeWidth={1.2}
              fill="none"
              strokeDasharray="3 3"
              markerEnd="url(#arrowhead-back)"
            />
          ))}

          {nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            return (
              <NodeBox
                key={node.id}
                node={node}
                position={pos}
                highlighted={node.id === highlightedId}
              />
            );
          })}

          {[...pointersByTarget.entries()].flatMap(([targetId, names]) => {
            const pos = positions.get(targetId);
            if (!pos) return [];
            return names.map((name, i) => (
              <PointerChip
                key={`${name}-${targetId}`}
                name={name}
                x={pos.x}
                y={pos.y}
                stackIndex={i}
              />
            ));
          })}
        </svg>
      </div>
      {caption ? (
        <p className="mt-3 text-stone-400 text-sm leading-relaxed">{caption}</p>
      ) : null}
      {nodes.length === 0 ? (
        <p className="mt-3 text-stone-500 italic text-sm">empty list</p>
      ) : null}
    </div>
  );
}
