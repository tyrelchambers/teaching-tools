// Learn-mode content. Each section has a body (paragraphs) and an optional
// diagram payload that the renderer turns into a single-frame display.

import { makeNode } from "../lib/linkedList.js";

function singlyFrame(values, pointers = {}, caption = "") {
  const nodes = values.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  const pointerObjs = {};
  for (const [name, idx] of Object.entries(pointers)) {
    if (typeof idx === "number" && idx >= 0 && idx < nodes.length) {
      pointerObjs[name] = nodes[idx];
    }
  }
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      value: n.value,
      nextId: n.next ? n.next.id : null,
      prevId: null,
    })),
    order: nodes.map((n) => n.id),
    pointers: Object.fromEntries(
      Object.entries(pointerObjs).map(([k, v]) => [k, v.id]),
    ),
    listType: "singly",
    line: null,
    caption,
  };
}

function doublyFrame(values, pointers = {}, caption = "") {
  const nodes = values.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length; i++) {
    if (i < nodes.length - 1) nodes[i].next = nodes[i + 1];
    if (i > 0) nodes[i].prev = nodes[i - 1];
  }
  const pointerObjs = {};
  for (const [name, idx] of Object.entries(pointers)) {
    if (typeof idx === "number" && idx >= 0 && idx < nodes.length) {
      pointerObjs[name] = nodes[idx];
    }
  }
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      value: n.value,
      nextId: n.next ? n.next.id : null,
      prevId: n.prev ? n.prev.id : null,
    })),
    order: nodes.map((n) => n.id),
    pointers: Object.fromEntries(
      Object.entries(pointerObjs).map(([k, v]) => [k, v.id]),
    ),
    listType: "doubly",
    line: null,
    caption,
  };
}

function circularFrame(values, pointers = {}, caption = "") {
  const nodes = values.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  if (nodes.length) nodes[nodes.length - 1].next = nodes[0];
  const pointerObjs = {};
  for (const [name, idx] of Object.entries(pointers)) {
    if (typeof idx === "number" && idx >= 0 && idx < nodes.length) {
      pointerObjs[name] = nodes[idx];
    }
  }
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      value: n.value,
      nextId: n.next ? n.next.id : null,
      prevId: null,
    })),
    order: nodes.map((n) => n.id),
    pointers: Object.fromEntries(
      Object.entries(pointerObjs).map(([k, v]) => [k, v.id]),
    ),
    listType: "circular",
    line: null,
    caption,
  };
}

export const CONCEPT_SECTIONS = [
  {
    id: "node",
    title: "A node is a value plus a pointer",
    body: [
      "A linked list is built from nodes. Each node holds a value and a reference to the next node. That's it. There is no underlying contiguous memory, no fixed size, no random index.",
      "In JavaScript a node is just an object: { value, next }. The arrow you see in the diagram is literally a property holding another object.",
    ],
    frame: singlyFrame([7], { head: 0 }, "One node. `next` is null — represented by ∅."),
  },
  {
    id: "head",
    title: "The head is the only handle you have",
    body: [
      "You don't index into a linked list. You hold a reference to the head, and from there every other node is reachable by following `next`.",
      "Lose the head reference and the entire list is unreachable garbage. That's why most linked-list bugs are head-pointer bugs: an off-by-one when prepending, or forgetting to update head after deletion.",
    ],
    frame: singlyFrame([1, 2, 3, 4], { head: 0 }, "All four nodes are reachable from `head`."),
  },
  {
    id: "traversal",
    title: "Traversal is O(n). There is no shortcut.",
    body: [
      "Want the 5th element? You walk: head, head.next, head.next.next, ... five times. Random access doesn't exist on a linked list — that's the price you pay for not having to copy memory on every insert.",
      "Big-O cheat sheet for a singly linked list: O(1) prepend, O(n) lookup by index, O(n) append (unless you also keep a tail pointer), O(1) deletion if you already hold a reference to the predecessor.",
    ],
    frame: singlyFrame([10, 20, 30, 40, 50], { head: 0, curr: 3 }, "Walking from head to index 3 takes 3 hops."),
  },
  {
    id: "doubly",
    title: "Doubly linked: prev as well as next",
    body: [
      "A doubly linked list adds a `prev` pointer to every node. Costs you another reference per node, but lets you delete a known node in O(1) without first walking the list to find its predecessor.",
      "Most production-quality LRU caches and editor undo stacks use doubly linked lists for exactly this reason.",
    ],
    frame: doublyFrame([1, 2, 3], { head: 0 }, "Each node stores prev (dashed) and next (solid)."),
  },
  {
    id: "circular",
    title: "Circular: the tail loops to the head",
    body: [
      "Replace the tail's `next = null` with `next = head` and you have a circular list. There is no terminator. Useful for round-robin schedulers and ring buffers.",
      "Watch your termination condition: walking with `while (curr)` will loop forever. Use `do { ... } while (curr !== head)` instead.",
    ],
    frame: circularFrame([1, 2, 3, 4], { head: 0 }, "The arc from the tail back to the head is the cycle."),
  },
  {
    id: "references",
    title: "Pointers are just object references",
    body: [
      "If you've worked with arrays, you might think of `node.next = otherNode` as 'copy otherNode here.' It isn't — it's a reference. Two variables can point at the same node.",
      "This matters when you reverse a list. The trick `prev = curr; curr = next;` works because each variable is a reference; assigning prev = curr doesn't duplicate anything.",
    ],
    frame: null,
  },
];
