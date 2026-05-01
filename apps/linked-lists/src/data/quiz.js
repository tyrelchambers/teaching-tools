// Practice-mode quiz. Each question: { id, prompt, code?, options, answer, explain }.
// `answer` is the index of the correct option.

export const QUIZ = [
  {
    id: "q1",
    prompt: "Given a singly linked list head → 1 → 2 → 3 → ∅, what is head.next.next.value?",
    options: ["1", "2", "3", "Throws an error"],
    answer: 2,
    explain: "head.next is the node holding 2; .next from there is the node holding 3.",
  },
  {
    id: "q2",
    prompt: "What is the time complexity of inserting at the HEAD of a singly linked list?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 0,
    explain: "Prepend just allocates a node and sets newNode.next = head. No walking.",
  },
  {
    id: "q3",
    prompt: "Inserting at the TAIL of a singly linked list with no tail pointer is...",
    options: ["O(1)", "O(log n)", "O(n)", "Impossible"],
    answer: 2,
    explain: "You walk from head to the last node before you can attach. Keep a tail pointer to make it O(1).",
  },
  {
    id: "q4",
    prompt: "Which technique typically uses a sentinel/dummy node?",
    options: [
      "Floyd's cycle detection",
      "Merging two sorted linked lists",
      "Counting nodes",
      "Reversing a list recursively",
    ],
    answer: 1,
    explain: "Merge uses a dummy so the first append doesn't need a special case for an empty result list.",
  },
  {
    id: "q5",
    prompt:
      "In iterative reversal, what's wrong with this loop body?\n  curr.next = prev;\n  curr = curr.next;\n  prev = curr;",
    options: [
      "Nothing — it's correct.",
      "After flipping curr.next, `curr = curr.next` walks BACKWARDS into prev. You lose the rest of the list.",
      "It uses too much extra space.",
      "It only reverses the first node.",
    ],
    answer: 1,
    explain: "You must save curr.next BEFORE flipping it: `const next = curr.next;`",
  },
  {
    id: "q6",
    prompt: "Which problem is Floyd's tortoise-and-hare designed to solve?",
    options: [
      "Sorting a linked list",
      "Detecting a cycle in O(1) extra space",
      "Reversing in place",
      "Merging two lists",
    ],
    answer: 1,
    explain: "Two pointers at different speeds will meet inside a cycle if one exists. No hash set needed.",
  },
  {
    id: "q7",
    prompt:
      "After running find-middle (slow/fast) on a list of length 4 (values 10, 20, 30, 40), what does slow point to?",
    options: ["10", "20", "30", "40"],
    answer: 2,
    explain:
      "When fast.next is null after two hops, slow has moved twice (10 → 20 → 30). For even lengths, slow lands on the second-half start.",
  },
  {
    id: "q8",
    prompt:
      "A doubly linked list adds a `prev` pointer. Which operation becomes O(1) that was O(n) on a singly linked list?",
    options: [
      "Lookup by index",
      "Insertion at tail (with no tail pointer)",
      "Deletion of a node you have a reference to",
      "Reversal",
    ],
    answer: 2,
    explain:
      "Singly linked deletion needs the predecessor (O(n) walk); doubly linked already stores it as `node.prev`.",
  },
  {
    id: "q9",
    prompt:
      "On a circular list, what's the bug in this loop?\n  let curr = head;\n  while (curr) { visit(curr); curr = curr.next; }",
    options: [
      "It misses the head",
      "It infinite-loops because curr is never null",
      "It only visits the first half",
      "Nothing — it's fine.",
    ],
    answer: 1,
    explain:
      "Circular lists have no null terminator. Use do/while with `curr !== head` as the stop condition.",
  },
  {
    id: "q10",
    prompt: "Which problem benefits most from a 'lead pointer N steps ahead, then walk together' pattern?",
    options: [
      "Reversing a list",
      "Finding the Nth node from the end in one pass",
      "Sorting a list",
      "Detecting a palindrome",
    ],
    answer: 1,
    explain: "The fixed gap between lead and trail makes 'Nth from end' a one-pass O(n) problem.",
  },
  {
    id: "q11",
    prompt:
      "When merging two sorted lists with a dummy head, what does the function return?",
    options: ["dummy", "dummy.next", "tail", "tail.next"],
    answer: 1,
    explain: "The dummy is throwaway — its `.next` is the real head of the merged list.",
  },
  {
    id: "q12",
    prompt:
      "An interview problem says: 'check if a singly linked list is a palindrome in O(1) space.' Which combination of techniques solves it?",
    options: [
      "Hash set + traversal",
      "Find middle + reverse second half + parallel walk",
      "Sort the list, then compare",
      "Recursive descent + stack",
    ],
    answer: 1,
    explain:
      "All three pieces in one: slow/fast finds the middle, the second half is reversed in place, then a two-pointer walk compares values.",
  },
  {
    id: "q13",
    prompt: "Adding two numbers stored as digit-lists with the LEAST significant digit first (e.g., 342 = 2→4→3) is easier than most-significant-first because…",
    options: [
      "You don't need a carry",
      "You can add digits left-to-right with a running carry, exactly like long addition",
      "Linked lists can't represent most-significant-first",
      "It avoids dummy heads",
    ],
    answer: 1,
    explain:
      "Walking front-to-back gives you ones, tens, hundreds — same direction the carry propagates.",
  },
  {
    id: "q14",
    prompt:
      "Why does the recursive reverse work?\n  function reverse(head) {\n    if (!head || !head.next) return head;\n    const newHead = reverse(head.next);\n    head.next.next = head;\n    head.next = null;\n    return newHead;\n  }",
    options: [
      "It accumulates a result variable",
      "It treats head.next as the head of an already-reversed sublist, then patches the link from head onto the end",
      "It builds a new list and discards the old one",
      "It uses memoization",
    ],
    answer: 1,
    explain:
      "After the recursive call, head.next is the tail of the reversed sublist. Setting head.next.next = head splices head onto the end; head.next = null becomes the new terminator.",
  },
  {
    id: "q15",
    prompt: "Which of these operations is NOT O(1) on a doubly linked list?",
    options: [
      "Inserting after a known node",
      "Deleting a known node",
      "Looking up the 5th element by index",
      "Inserting at head",
    ],
    answer: 2,
    explain:
      "Index lookup still requires walking. Doubly linked saves you the predecessor walk for deletion, not random access.",
  },
];
