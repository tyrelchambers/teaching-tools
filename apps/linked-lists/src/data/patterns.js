// Pattern-mode problems. Each: { id, prompt, options (technique ids from
// techniques.js), answer (the correct id), explain }.

export const PATTERN_OPTIONS = [
  { id: "dummy-head", label: "Dummy head" },
  { id: "find-middle", label: "Two-pointer (slow/fast)" },
  { id: "nth-from-end", label: "Two-pointer (lead/trail)" },
  { id: "reverse-iterative", label: "In-place reverse" },
  { id: "merge-sorted", label: "Dummy head + merge" },
  { id: "cycle-detect", label: "Floyd's cycle detection" },
  { id: "palindrome", label: "Find middle + reverse + walk" },
  { id: "add-two-numbers", label: "Digit-by-digit + carry" },
];

export const PATTERN_PROBLEMS = [
  {
    id: "p1",
    prompt:
      "Remove every node with value 7 from a singly linked list — including possibly the head. Keep the code branch-free for the head case.",
    answer: "dummy-head",
    explain:
      "A dummy node before the head means deleting the first node looks the same as deleting any other.",
  },
  {
    id: "p2",
    prompt:
      "Find the middle node of a singly linked list in one pass without using length.",
    answer: "find-middle",
    explain:
      "Slow advances one, fast advances two. When fast falls off, slow is on the middle.",
  },
  {
    id: "p3",
    prompt:
      "Remove the Nth node from the end of a singly linked list in one pass, without computing the length first.",
    answer: "nth-from-end",
    explain:
      "Move a lead pointer N+1 steps ahead, then walk both together. When lead is null, trail is at the predecessor of the target.",
  },
  {
    id: "p4",
    prompt:
      "Reverse a singly linked list in place, in O(n) time and O(1) extra space.",
    answer: "reverse-iterative",
    explain:
      "Three-pointer (prev/curr/next) shuffle. Each iteration flips one link.",
  },
  {
    id: "p5",
    prompt:
      "Given the heads of two sorted linked lists, return one merged sorted list — splicing nodes, not copying values.",
    answer: "merge-sorted",
    explain:
      "Dummy head + tail pointer + compare-and-splice loop. Return dummy.next.",
  },
  {
    id: "p6",
    prompt:
      "Given the head of a singly linked list, determine whether it contains a cycle and (if so) where the cycle starts. O(1) extra space.",
    answer: "cycle-detect",
    explain:
      "Floyd's tortoise-and-hare. Once they meet, reset one pointer to head and walk both at the same speed.",
  },
  {
    id: "p7",
    prompt:
      "Determine whether a singly linked list of integers reads the same forwards and backwards. O(1) extra space.",
    answer: "palindrome",
    explain:
      "Find middle, reverse the second half in place, walk first half and reversed second half in parallel.",
  },
  {
    id: "p8",
    prompt:
      "Two non-negative integers are stored as singly linked lists with the least-significant digit first. Return their sum as the same kind of list.",
    answer: "add-two-numbers",
    explain:
      "Walk both lists in parallel, add digit + digit + carry, append a new digit node, propagate carry to the next iteration. Use a dummy head for the result.",
  },
];
