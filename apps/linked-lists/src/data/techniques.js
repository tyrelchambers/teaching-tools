// Technique registry. Each entry: { id, name, category, summary, code,
// defaultInput, runner(values) → frames }. Runners create stable Node
// objects once, mutate them as the algorithm runs, and snapshot frames
// after each meaningful step.

import { makeNode } from "../lib/linkedList.js";
import { createTrace } from "../lib/trace.js";

// ── Helpers ────────────────────────────────────────────────────────────

function buildSingly(values) {
  if (values.length === 0) return { head: null, nodes: [] };
  const nodes = values.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  return { head: nodes[0], nodes };
}

function buildDoubly(values) {
  if (values.length === 0) return { head: null, nodes: [] };
  const nodes = values.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length; i++) {
    if (i < nodes.length - 1) nodes[i].next = nodes[i + 1];
    if (i > 0) nodes[i].prev = nodes[i - 1];
  }
  return { head: nodes[0], nodes };
}

function buildCircular(values) {
  if (values.length === 0) return { head: null, nodes: [] };
  const nodes = values.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  nodes[nodes.length - 1].next = nodes[0];
  return { head: nodes[0], nodes };
}

// ── 1. Dummy head / sentinel ───────────────────────────────────────────

const dummyHeadCode = [
  { text: "function deleteByValue(head, target) {" },
  { text: "  const dummy = { value: null, next: head };" },
  { text: "  let prev = dummy;" },
  { text: "  while (prev.next) {" },
  { text: "    if (prev.next.value === target) {" },
  { text: "      prev.next = prev.next.next;" },
  { text: "    } else {" },
  { text: "      prev = prev.next;" },
  { text: "    }" },
  { text: "  }" },
  { text: "  return dummy.next;" },
  { text: "}" },
];

function dummyHeadRunner(values, target = null) {
  const t = target ?? values[0];
  const { head, nodes } = buildSingly(values);
  const trace = createTrace();
  const dummy = makeNode("·", { id: "dummy" });
  dummy.next = head;
  const allNodes = [dummy, ...nodes];
  const order = [dummy, ...nodes];

  trace.frame({
    nodes: allNodes,
    order,
    pointers: { head, dummy },
    line: 1,
    caption: `Goal: delete every node equal to ${t}.`,
  });
  trace.frame({
    nodes: allNodes,
    order,
    pointers: { dummy },
    line: 2,
    caption: "Create a dummy node that points at the head. Now there is no special case for deleting the first node.",
  });

  let prev = dummy;
  trace.frame({
    nodes: allNodes,
    order,
    pointers: { dummy, prev },
    line: 3,
    caption: "Walk with `prev`, deciding whether to skip prev.next.",
  });

  let currentHead = head;
  while (prev.next) {
    trace.frame({
      nodes: allNodes,
      order,
      pointers: { dummy, prev, curr: prev.next },
      line: 5,
      caption: `Compare prev.next.value (${prev.next.value}) to ${t}.`,
    });
    if (prev.next.value === t) {
      prev.next = prev.next.next;
      if (prev === dummy) currentHead = dummy.next;
      trace.frame({
        nodes: allNodes,
        order,
        pointers: { dummy, prev, head: currentHead },
        line: 6,
        caption: `Match — bypass it: prev.next = prev.next.next.`,
      });
    } else {
      prev = prev.next;
      trace.frame({
        nodes: allNodes,
        order,
        pointers: { dummy, prev, head: currentHead },
        line: 8,
        caption: "No match — advance prev.",
      });
    }
  }

  trace.frame({
    nodes: allNodes,
    order,
    pointers: { head: dummy.next, dummy },
    line: 11,
    caption: "Done. Real head is dummy.next, even if every original node was deleted.",
  });

  return trace.frames;
}

// ── 2. Two-pointer: find middle ─────────────────────────────────────────

const findMiddleCode = [
  { text: "function middle(head) {" },
  { text: "  let slow = head;" },
  { text: "  let fast = head;" },
  { text: "  while (fast && fast.next) {" },
  { text: "    slow = slow.next;" },
  { text: "    fast = fast.next.next;" },
  { text: "  }" },
  { text: "  return slow;" },
  { text: "}" },
];

function findMiddleRunner(values) {
  const { head, nodes } = buildSingly(values);
  const trace = createTrace();
  let slow = head;
  let fast = head;

  trace.frame({
    nodes,
    pointers: { head, slow, fast },
    line: 1,
    caption: "Two pointers start at head. Fast moves twice as quickly as slow.",
  });

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    trace.frame({
      nodes,
      pointers: { head, slow, fast },
      line: 5,
      caption: "Advance: slow → 1 step, fast → 2 steps.",
    });
  }

  trace.frame({
    nodes,
    pointers: { head, slow, fast },
    line: 8,
    caption: `When fast falls off the end, slow sits on the middle: ${slow ? slow.value : "null"}.`,
  });
  return trace.frames;
}

// ── 3. Two-pointer: Nth from end ────────────────────────────────────────

const nthFromEndCode = [
  { text: "function nthFromEnd(head, n) {" },
  { text: "  let lead = head;" },
  { text: "  for (let i = 0; i < n; i++) lead = lead.next;" },
  { text: "  let trail = head;" },
  { text: "  while (lead) {" },
  { text: "    lead = lead.next;" },
  { text: "    trail = trail.next;" },
  { text: "  }" },
  { text: "  return trail;" },
  { text: "}" },
];

function nthFromEndRunner(values, n = 2) {
  const { head, nodes } = buildSingly(values);
  const trace = createTrace();
  let lead = head;

  trace.frame({
    nodes,
    pointers: { head, lead },
    line: 1,
    caption: `Find the ${n}-th node from the end.`,
  });

  for (let i = 0; i < n; i++) {
    if (!lead) break;
    lead = lead.next;
    trace.frame({
      nodes,
      pointers: { head, lead },
      line: 3,
      caption: `Advance lead ${i + 1}/${n}. Now there's a fixed gap of ${n} between lead and head.`,
    });
  }

  let trail = head;
  trace.frame({
    nodes,
    pointers: { head, lead, trail },
    line: 4,
    caption: "Place trail at head. Walk both together — when lead falls off, trail is at the answer.",
  });

  while (lead) {
    lead = lead.next;
    trail = trail.next;
    trace.frame({
      nodes,
      pointers: { head, lead, trail },
      line: 6,
      caption: "Advance both together.",
    });
  }

  trace.frame({
    nodes,
    pointers: { head, trail, result: trail },
    line: 9,
    caption: `${n}-th from end = ${trail ? trail.value : "null"}.`,
  });
  return trace.frames;
}

// ── 4. Reverse iteratively ─────────────────────────────────────────────

const reverseIterativeCode = [
  { text: "function reverse(head) {" },
  { text: "  let prev = null;" },
  { text: "  let curr = head;" },
  { text: "  while (curr) {" },
  { text: "    const next = curr.next;" },
  { text: "    curr.next = prev;" },
  { text: "    prev = curr;" },
  { text: "    curr = next;" },
  { text: "  }" },
  { text: "  return prev;" },
  { text: "}" },
];

function reverseIterativeRunner(values) {
  const { head, nodes } = buildSingly(values);
  const trace = createTrace();
  let prev = null;
  let curr = head;

  trace.frame({
    nodes,
    pointers: { head, curr },
    line: 1,
    caption: "Initial. We'll walk forward and flip each next pointer to point back.",
  });

  while (curr) {
    trace.frame({
      nodes,
      pointers: { head, prev, curr },
      line: 4,
      caption: "Save curr.next so we don't lose it.",
    });
    const next = curr.next;
    trace.frame({
      nodes,
      pointers: { head, prev, curr, next },
      line: 5,
      caption: "next = curr.next.",
    });
    curr.next = prev;
    trace.frame({
      nodes,
      pointers: { head, prev, curr, next },
      line: 6,
      caption: "Flip the link: curr.next = prev.",
    });
    prev = curr;
    curr = next;
    trace.frame({
      nodes,
      pointers: { head, prev, curr },
      line: 8,
      caption: "Advance: prev = curr, curr = next.",
    });
  }

  trace.frame({
    nodes,
    pointers: { head: prev, prev },
    line: 10,
    caption: "Done. New head is prev (the former tail).",
  });
  return trace.frames;
}

// ── 5. Reverse recursively ─────────────────────────────────────────────

const reverseRecursiveCode = [
  { text: "function reverse(head) {" },
  { text: "  if (!head || !head.next) return head;" },
  { text: "  const newHead = reverse(head.next);" },
  { text: "  head.next.next = head;" },
  { text: "  head.next = null;" },
  { text: "  return newHead;" },
  { text: "}" },
];

function reverseRecursiveRunner(values) {
  const { head, nodes } = buildSingly(values);
  const trace = createTrace();

  trace.frame({
    nodes,
    pointers: { head },
    line: 1,
    caption: "We'll recurse to the tail, then flip pointers as the stack unwinds.",
  });

  // Build the call stack manually so we can frame at each level.
  const stack = [];
  let curr = head;
  while (curr) {
    stack.push(curr);
    trace.frame({
      nodes,
      pointers: { head, curr },
      line: 3,
      caption: `Recurse into reverse(${curr.value}.next).`,
    });
    if (!curr.next) {
      trace.frame({
        nodes,
        pointers: { head, curr, newHead: curr },
        line: 2,
        caption: `Base case: only one node left. Return ${curr.value} as newHead.`,
      });
      break;
    }
    curr = curr.next;
  }

  // Unwind: at each level, head.next.next = head; head.next = null.
  let newHead = stack[stack.length - 1];
  for (let i = stack.length - 2; i >= 0; i--) {
    const headAtLevel = stack[i];
    trace.frame({
      nodes,
      pointers: { head: stack[0], curr: headAtLevel, newHead },
      line: 4,
      caption: `Unwinding: at this level, head=${headAtLevel.value}. Set head.next.next = head.`,
    });
    headAtLevel.next.next = headAtLevel;
    trace.frame({
      nodes,
      pointers: { head: stack[0], curr: headAtLevel, newHead },
      line: 5,
      caption: "Cut the forward link: head.next = null.",
    });
    headAtLevel.next = null;
    trace.frame({
      nodes,
      pointers: { head: newHead, curr: headAtLevel, newHead },
      line: 6,
      caption: `Return newHead (=${newHead.value}) up the stack.`,
    });
  }

  trace.frame({
    nodes,
    pointers: { head: newHead, newHead },
    line: 6,
    caption: "Done. List is reversed.",
  });
  return trace.frames;
}

// ── 6. Merge two sorted lists ──────────────────────────────────────────

const mergeSortedCode = [
  { text: "function merge(a, b) {" },
  { text: "  const dummy = { next: null };" },
  { text: "  let tail = dummy;" },
  { text: "  while (a && b) {" },
  { text: "    if (a.value <= b.value) {" },
  { text: "      tail.next = a; a = a.next;" },
  { text: "    } else {" },
  { text: "      tail.next = b; b = b.next;" },
  { text: "    }" },
  { text: "    tail = tail.next;" },
  { text: "  }" },
  { text: "  tail.next = a || b;" },
  { text: "  return dummy.next;" },
  { text: "}" },
];

function mergeSortedRunner(valuesA = [1, 4, 6], valuesB = [2, 3, 5]) {
  const a0 = buildSingly(valuesA);
  const b0 = buildSingly(valuesB);
  const trace = createTrace();
  const dummy = makeNode("·", { id: "dummy" });
  let a = a0.head;
  let b = b0.head;
  let tail = dummy;

  // Layout: dummy, then a-chain, then b-chain (visual; merging will rewire).
  const order = [dummy, ...a0.nodes, ...b0.nodes];
  const allNodes = order;

  trace.frame({
    nodes: allNodes,
    order,
    pointers: { dummy, p1: a, p2: b, tail },
    line: 1,
    caption: "Two sorted inputs. Use a dummy head so we don't special-case the first append.",
  });

  while (a && b) {
    trace.frame({
      nodes: allNodes,
      order,
      pointers: { dummy, p1: a, p2: b, tail },
      line: 5,
      caption: `Compare ${a.value} vs ${b.value}.`,
    });
    if (a.value <= b.value) {
      tail.next = a;
      const next = a.next;
      a = next;
      trace.frame({
        nodes: allNodes,
        order,
        pointers: { dummy, p1: a, p2: b, tail },
        line: 6,
        caption: "Splice the smaller node onto tail; advance p1.",
      });
    } else {
      tail.next = b;
      const next = b.next;
      b = next;
      trace.frame({
        nodes: allNodes,
        order,
        pointers: { dummy, p1: a, p2: b, tail },
        line: 8,
        caption: "Splice the smaller node onto tail; advance p2.",
      });
    }
    tail = tail.next;
    trace.frame({
      nodes: allNodes,
      order,
      pointers: { dummy, p1: a, p2: b, tail },
      line: 10,
      caption: "Advance tail.",
    });
  }

  tail.next = a || b;
  trace.frame({
    nodes: allNodes,
    order,
    pointers: { dummy, tail, head: dummy.next },
    line: 12,
    caption: "Attach whatever remains of the non-empty input.",
  });

  trace.frame({
    nodes: allNodes,
    order,
    pointers: { head: dummy.next, dummy },
    line: 13,
    caption: "Real head = dummy.next.",
  });
  return trace.frames;
}

// ── 7. Floyd's cycle detection ─────────────────────────────────────────

const cycleDetectCode = [
  { text: "function detectCycle(head) {" },
  { text: "  let slow = head, fast = head;" },
  { text: "  while (fast && fast.next) {" },
  { text: "    slow = slow.next;" },
  { text: "    fast = fast.next.next;" },
  { text: "    if (slow === fast) break;" },
  { text: "  }" },
  { text: "  if (!fast || !fast.next) return null;" },
  { text: "  // find cycle start" },
  { text: "  let entry = head;" },
  { text: "  while (entry !== slow) {" },
  { text: "    entry = entry.next;" },
  { text: "    slow = slow.next;" },
  { text: "  }" },
  { text: "  return entry;" },
  { text: "}" },
];

function cycleDetectRunner(values = [1, 2, 3, 4, 5, 6], cycleAt = 2) {
  const { head, nodes } = buildSingly(values);
  // Create a cycle: tail → nodes[cycleAt]
  if (cycleAt >= 0 && cycleAt < nodes.length) {
    nodes[nodes.length - 1].next = nodes[cycleAt];
  }
  const trace = createTrace();
  let slow = head;
  let fast = head;

  trace.frame({
    nodes,
    pointers: { head, slow, fast },
    line: 1,
    caption: "If there's a cycle, slow and fast will eventually meet inside it.",
  });

  let met = false;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    trace.frame({
      nodes,
      pointers: { head, slow, fast },
      line: 5,
      caption: "Advance.",
    });
    if (slow === fast) {
      met = true;
      trace.frame({
        nodes,
        pointers: { head, slow, fast, meet: slow },
        line: 6,
        caption: "Met! There's a cycle.",
      });
      break;
    }
  }

  if (!met) {
    trace.frame({
      nodes,
      pointers: { head },
      line: 8,
      caption: "fast fell off the end — no cycle.",
    });
    return trace.frames;
  }

  let entry = head;
  trace.frame({
    nodes,
    pointers: { head, slow, fast, entry, meet: slow },
    line: 10,
    caption: "Now find the cycle start. Reset entry = head; advance entry and slow together.",
  });

  while (entry !== slow) {
    entry = entry.next;
    slow = slow.next;
    trace.frame({
      nodes,
      pointers: { head, slow, entry },
      line: 12,
      caption: "Advance entry and slow one step each.",
    });
  }

  trace.frame({
    nodes,
    pointers: { head, cycleStart: entry },
    line: 15,
    caption: `Cycle starts at ${entry.value}. (Math: distance head→entry equals distance meet-point→entry.)`,
  });
  return trace.frames;
}

// ── 8. Palindrome check (find middle + reverse second half) ────────────

const palindromeCode = [
  { text: "function isPalindrome(head) {" },
  { text: "  let slow = head, fast = head;" },
  { text: "  while (fast && fast.next) {" },
  { text: "    slow = slow.next;" },
  { text: "    fast = fast.next.next;" },
  { text: "  }" },
  { text: "  let second = reverse(slow);" },
  { text: "  let p1 = head, p2 = second;" },
  { text: "  while (p2) {" },
  { text: "    if (p1.value !== p2.value) return false;" },
  { text: "    p1 = p1.next; p2 = p2.next;" },
  { text: "  }" },
  { text: "  return true;" },
  { text: "}" },
];

function palindromeRunner(values = [1, 2, 3, 2, 1]) {
  const { head, nodes } = buildSingly(values);
  const trace = createTrace();
  let slow = head;
  let fast = head;

  trace.frame({
    nodes,
    pointers: { head, slow, fast },
    line: 1,
    caption: "Plan: find the middle, reverse the second half, walk both halves in parallel.",
  });

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    trace.frame({
      nodes,
      pointers: { head, slow, fast },
      line: 4,
      caption: "Find middle.",
    });
  }

  // Reverse the second half starting at slow.
  let prev = null;
  let curr = slow;
  trace.frame({
    nodes,
    pointers: { head, slow, curr },
    line: 7,
    caption: "Reverse the second half in place.",
  });
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
    trace.frame({
      nodes,
      pointers: { head, prev, curr },
      line: 7,
      caption: "Reversing…",
    });
  }
  const second = prev;

  let p1 = head;
  let p2 = second;
  let result = true;
  trace.frame({
    nodes,
    pointers: { head, p1, p2 },
    line: 8,
    caption: "Walk first half (p1) and reversed second half (p2) together.",
  });
  while (p2) {
    trace.frame({
      nodes,
      pointers: { head, p1, p2 },
      line: 10,
      caption: `Compare ${p1.value} vs ${p2.value}.`,
    });
    if (p1.value !== p2.value) {
      result = false;
      break;
    }
    p1 = p1.next;
    p2 = p2.next;
  }

  trace.frame({
    nodes,
    pointers: { head },
    line: 13,
    caption: result ? "All matched — it's a palindrome." : "Mismatch — not a palindrome.",
    extras: { result },
  });
  return trace.frames;
}

// ── 9. Add two numbers (digits in reverse) ─────────────────────────────

const addTwoNumbersCode = [
  { text: "function add(a, b) {" },
  { text: "  const dummy = { next: null };" },
  { text: "  let tail = dummy, carry = 0;" },
  { text: "  while (a || b || carry) {" },
  { text: "    const x = a ? a.value : 0;" },
  { text: "    const y = b ? b.value : 0;" },
  { text: "    const sum = x + y + carry;" },
  { text: "    carry = Math.floor(sum / 10);" },
  { text: "    tail.next = { value: sum % 10, next: null };" },
  { text: "    tail = tail.next;" },
  { text: "    a = a?.next; b = b?.next;" },
  { text: "  }" },
  { text: "  return dummy.next;" },
  { text: "}" },
];

function addTwoNumbersRunner(valuesA = [2, 4, 3], valuesB = [5, 6, 4]) {
  const a0 = buildSingly(valuesA);
  const b0 = buildSingly(valuesB);
  const trace = createTrace();
  const dummy = makeNode("·", { id: "dummy" });
  let tail = dummy;
  let carry = 0;
  let a = a0.head;
  let b = b0.head;
  const resultNodes = [];
  const order = () => [dummy, ...resultNodes, ...a0.nodes, ...b0.nodes];
  const allNodes = () => [dummy, ...resultNodes, ...a0.nodes, ...b0.nodes];

  trace.frame({
    nodes: allNodes(),
    order: order(),
    pointers: { p1: a, p2: b, tail, dummy },
    line: 1,
    caption: `Sum digit-by-digit: ${valuesA.join("→")}  +  ${valuesB.join("→")}. Each list stores its number with the LEAST significant digit first.`,
  });

  while (a || b || carry) {
    const x = a ? a.value : 0;
    const y = b ? b.value : 0;
    const sum = x + y + carry;
    carry = Math.floor(sum / 10);
    const digit = sum % 10;
    const node = makeNode(digit);
    resultNodes.push(node);
    tail.next = node;
    tail = node;
    trace.frame({
      nodes: allNodes(),
      order: order(),
      pointers: { p1: a, p2: b, tail, carry: carry > 0 ? tail : null, dummy },
      line: 9,
      caption: `${x} + ${y} + carry = ${sum}. Append digit ${digit}; new carry = ${carry}.`,
    });
    a = a ? a.next : null;
    b = b ? b.next : null;
  }

  trace.frame({
    nodes: allNodes(),
    order: order(),
    pointers: { head: dummy.next, dummy },
    line: 13,
    caption: "Result list = dummy.next, also stored least-significant-first.",
  });
  return trace.frames;
}

// ── 10. Doubly linked list: insert + delete ────────────────────────────

const doublyCode = [
  { text: "// insert v after node n" },
  { text: "function insertAfter(n, v) {" },
  { text: "  const node = { value: v, prev: n, next: n.next };" },
  { text: "  if (n.next) n.next.prev = node;" },
  { text: "  n.next = node;" },
  { text: "}" },
  { text: "// delete node n" },
  { text: "function remove(n) {" },
  { text: "  if (n.prev) n.prev.next = n.next;" },
  { text: "  if (n.next) n.next.prev = n.prev;" },
  { text: "}" },
];

function doublyRunner(values = [10, 20, 40]) {
  const { head, nodes } = buildDoubly(values);
  const trace = createTrace({ listType: "doubly" });
  const all = [...nodes];
  trace.frame({
    nodes: all,
    pointers: { head },
    line: 1,
    caption: "Doubly linked: every node stores prev and next. O(1) deletion given a node reference.",
    type: "doubly",
  });

  // Insert 30 after node[1] (value 20)
  const target = nodes[1];
  trace.frame({
    nodes: all,
    pointers: { head, curr: target },
    line: 2,
    caption: `Insert 30 after node ${target.value}.`,
    type: "doubly",
  });
  const newNode = makeNode(30);
  newNode.prev = target;
  newNode.next = target.next;
  all.splice(2, 0, newNode);
  trace.frame({
    nodes: all,
    pointers: { head, curr: target, next: newNode },
    line: 3,
    caption: "Wire new node's prev and next.",
    type: "doubly",
  });
  if (target.next) target.next.prev = newNode;
  target.next = newNode;
  trace.frame({
    nodes: all,
    pointers: { head, curr: newNode },
    line: 5,
    caption: "Re-wire neighbors. Insertion is O(1).",
    type: "doubly",
  });

  // Delete node[0] (head)
  const victim = all[0];
  trace.frame({
    nodes: all,
    pointers: { head, curr: victim },
    line: 8,
    caption: `Now delete the head node (${victim.value}).`,
    type: "doubly",
  });
  if (victim.prev) victim.prev.next = victim.next;
  if (victim.next) victim.next.prev = victim.prev;
  const newHead = victim.next;
  trace.frame({
    nodes: all,
    pointers: { head: newHead },
    line: 10,
    caption: "Done. Notice we never had to walk the list — both deletes were O(1).",
    type: "doubly",
  });
  return trace.frames;
}

// ── 11. Circular linked list ───────────────────────────────────────────

const circularCode = [
  { text: "function traverse(head) {" },
  { text: "  if (!head) return;" },
  { text: "  let curr = head;" },
  { text: "  do {" },
  { text: "    visit(curr);" },
  { text: "    curr = curr.next;" },
  { text: "  } while (curr !== head);" },
  { text: "}" },
];

function circularRunner(values = [1, 2, 3, 4]) {
  const { head, nodes } = buildCircular(values);
  const trace = createTrace({ listType: "circular" });
  trace.frame({
    nodes,
    pointers: { head },
    line: 1,
    caption: "Circular list: the tail's next points back to head. There is no null terminator.",
    type: "circular",
  });

  let curr = head;
  let i = 0;
  do {
    trace.frame({
      nodes,
      pointers: { head, curr },
      line: 5,
      caption: `Visit ${curr.value}.`,
      type: "circular",
    });
    curr = curr.next;
    i++;
    if (i > nodes.length + 1) break;
  } while (curr !== head);

  trace.frame({
    nodes,
    pointers: { head, curr },
    line: 7,
    caption: "Stop condition is curr === head, NOT curr === null. Forgetting this gives an infinite loop.",
    type: "circular",
  });
  return trace.frames;
}

// ── Registry ───────────────────────────────────────────────────────────

export const TECHNIQUES = [
  {
    id: "dummy-head",
    name: "Dummy head / sentinel",
    category: "Pattern",
    summary:
      "A throwaway node before the head removes the special case for inserting/deleting at the front. Used by merge, remove-by-value, and many list-construction algorithms.",
    code: dummyHeadCode,
    defaultInput: [3, 1, 3, 5, 3],
    runner: (vs) => dummyHeadRunner(vs, 3),
  },
  {
    id: "find-middle",
    name: "Two-pointer: find middle",
    category: "Two-pointer",
    summary:
      "Slow advances by one, fast by two. When fast reaches the end, slow is on the middle — one pass, no length precomputation.",
    code: findMiddleCode,
    defaultInput: [1, 2, 3, 4, 5],
    runner: findMiddleRunner,
  },
  {
    id: "nth-from-end",
    name: "Two-pointer: Nth from end",
    category: "Two-pointer",
    summary:
      "Move a lead pointer N steps ahead, then walk both together. When lead falls off, trail is at the answer — one pass, constant extra space.",
    code: nthFromEndCode,
    defaultInput: [1, 2, 3, 4, 5, 6],
    runner: (vs) => nthFromEndRunner(vs, 2),
  },
  {
    id: "reverse-iterative",
    name: "Reverse iteratively",
    category: "Transform",
    summary:
      "Walk forward with three pointers — prev, curr, next — flipping each next pointer to point at prev. The classic three-variable shuffle.",
    code: reverseIterativeCode,
    defaultInput: [1, 2, 3, 4, 5],
    runner: reverseIterativeRunner,
  },
  {
    id: "reverse-recursive",
    name: "Reverse recursively",
    category: "Transform",
    summary:
      "Recurse to the tail, then on the way back up, flip head.next.next = head and clear head.next. Same algorithm as the iterative version, written upside-down.",
    code: reverseRecursiveCode,
    defaultInput: [1, 2, 3, 4],
    runner: reverseRecursiveRunner,
  },
  {
    id: "merge-sorted",
    name: "Merge two sorted lists",
    category: "Pattern",
    summary:
      "The textbook dummy-head use case. Compare heads, splice the smaller, advance, repeat. Tail.next picks up whatever remains.",
    code: mergeSortedCode,
    defaultInput: [1, 4, 6],
    runner: (vs) => mergeSortedRunner(vs, [2, 3, 5]),
  },
  {
    id: "cycle-detect",
    name: "Floyd's cycle detection",
    category: "Two-pointer",
    summary:
      "Tortoise and hare. If fast ever meets slow, there's a cycle. Bonus: resetting one pointer to head and walking both at the same speed lands them on the cycle's entry node.",
    code: cycleDetectCode,
    defaultInput: [1, 2, 3, 4, 5, 6],
    runner: (vs) => cycleDetectRunner(vs, 2),
  },
  {
    id: "palindrome",
    name: "Palindrome check",
    category: "Composite",
    summary:
      "Two techniques fused: find-middle + reverse-second-half + parallel-walk. O(n) time, O(1) space — better than copying values to an array.",
    code: palindromeCode,
    defaultInput: [1, 2, 3, 2, 1],
    runner: palindromeRunner,
  },
  {
    id: "add-two-numbers",
    name: "Add two numbers",
    category: "Pattern",
    summary:
      "Digits stored least-significant-first → just walk both lists, add digit + digit + carry, build a new list with a dummy head. Carry can produce one extra node.",
    code: addTwoNumbersCode,
    defaultInput: [2, 4, 3],
    runner: (vs) => addTwoNumbersRunner(vs, [5, 6, 4]),
  },
  {
    id: "doubly",
    name: "Doubly linked: insert/delete",
    category: "List type",
    summary:
      "Each node stores prev and next. Costs more memory but gives you O(1) deletion of any node you have a pointer to — no need to walk to find the predecessor.",
    code: doublyCode,
    defaultInput: [10, 20, 40],
    runner: doublyRunner,
  },
  {
    id: "circular",
    name: "Circular list: traversal",
    category: "List type",
    summary:
      "Tail.next loops back to head; there is no null terminator. Use a do/while terminating on curr === head — not curr === null.",
    code: circularCode,
    defaultInput: [1, 2, 3, 4],
    runner: circularRunner,
  },
];

export function getTechniqueById(id) {
  return TECHNIQUES.find((t) => t.id === id) ?? null;
}
