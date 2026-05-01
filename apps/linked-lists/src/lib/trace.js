// Trace recorder. Each runner creates a stable set of nodes once, mutates
// their `next`/`prev` pointers as the algorithm progresses, and calls
// frame(...) at each meaningful step. Snapshots are deep-cloned so playback
// reflects state at the moment of the call, not the final state.
//
// Frame shape:
//   {
//     nodes:    [{ id, value, nextId, prevId }],
//     order:    [id, ...],                     // visual left-to-right order
//     pointers: { head, slow, fast, dummy, prev, curr, ... },
//     listType: "singly" | "doubly" | "circular",
//     line:     number | null,                 // 1-based active code line
//     caption:  string,
//     extras:   { ... }                        // freeform per-technique data
//   }

export function createTrace({ listType = "singly" } = {}) {
  const frames = [];

  function frame({
    nodes,
    order,
    pointers = {},
    line = null,
    caption = "",
    extras = {},
    type,
  }) {
    if (!Array.isArray(nodes)) {
      throw new Error("trace.frame: nodes array is required");
    }
    const serialized = nodes.map((n) => ({
      id: n.id,
      value: n.value,
      nextId: n.next ? n.next.id : null,
      prevId: n.prev ? n.prev.id : null,
    }));
    const layoutIds = (order ?? nodes).map((n) => (typeof n === "string" ? n : n.id));

    const pointerIds = {};
    for (const [name, target] of Object.entries(pointers)) {
      pointerIds[name] = target ? target.id : null;
    }

    frames.push({
      nodes: serialized,
      order: layoutIds,
      pointers: pointerIds,
      listType: type ?? listType,
      line,
      caption,
      extras: { ...extras },
    });
  }

  return { frame, frames };
}
