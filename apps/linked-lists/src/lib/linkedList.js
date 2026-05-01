// Linked-list primitives used by every technique runner and the sandbox.
//
// Nodes carry an opaque stable `id` so the diagram renderer can keyframe
// position transitions across mutating frames (same id = same DOM node =
// CSS-animated movement).

let _nextId = 1;
const freshId = () => `n${_nextId++}`;

export function makeNode(value, { id = freshId(), next = null, prev = null } = {}) {
  return { id, value, next, prev };
}

export function fromArray(values, { type = "singly" } = {}) {
  if (values.length === 0) return { head: null, type };
  const nodes = values.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  if (type === "doubly") {
    for (let i = 1; i < nodes.length; i++) nodes[i].prev = nodes[i - 1];
  }
  if (type === "circular") {
    nodes[nodes.length - 1].next = nodes[0];
  }
  return { head: nodes[0], type };
}

export function toArray(head, { type = "singly", limit = 1000 } = {}) {
  const out = [];
  let curr = head;
  let i = 0;
  while (curr && i < limit) {
    out.push(curr.value);
    curr = curr.next;
    if (type === "circular" && curr === head) break;
    i++;
  }
  return out;
}

export function length(head, { type = "singly", limit = 1000 } = {}) {
  let n = 0;
  let curr = head;
  while (curr && n < limit) {
    n++;
    curr = curr.next;
    if (type === "circular" && curr === head) break;
  }
  return n;
}

export function nodeAt(head, index, { type = "singly" } = {}) {
  let curr = head;
  let i = 0;
  while (curr && i < index) {
    curr = curr.next;
    i++;
    if (type === "circular" && curr === head) return null;
  }
  return curr;
}

export function tail(head, { type = "singly" } = {}) {
  if (!head) return null;
  if (type === "circular") {
    let curr = head;
    while (curr.next !== head) curr = curr.next;
    return curr;
  }
  let curr = head;
  while (curr.next) curr = curr.next;
  return curr;
}

// Walk a list with a per-node visitor, safely. Returns visited node count.
export function forEach(head, fn, { type = "singly", limit = 1000 } = {}) {
  let curr = head;
  let i = 0;
  while (curr && i < limit) {
    fn(curr, i);
    curr = curr.next;
    i++;
    if (type === "circular" && curr === head) break;
  }
  return i;
}
