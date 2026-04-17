// ============================================================
// PRACTICE QUESTIONS
// Shape: { id, tier, type, prompt, code?[], options?[], answer,
//         explanation, correctLines?[], optionA?, optionB?,
//         expr?, width?, expectedBits?[], operands?[] }
// Types: multiple_choice | true_false | identify_lines | compare | predict_bits
// Tiers: 1 Fundamentals | 2 Recognition | 3 Application | 4 Composition | 5 Traps & Gotchas
// Bit arrays are MSB-first. predict_bits questions must declare `width`.
// ============================================================
export const questions = [
  // ============================================================
  // TIER 1 — Fundamentals: what does each operator mean?
  // ============================================================
  { id: "t1-and-def", tier: 1, type: "multiple_choice",
    prompt: "What does the & operator do on two bits?",
    options: [
      "1 only when both bits are 1",
      "1 when either bit is 1",
      "1 when the bits differ",
      "Flips both bits",
    ],
    answer: 0,
    explanation: "AND is the intersection: both-and-only-both. It's how you ask 'keep just these bits'." },

  { id: "t1-or-def", tier: 1, type: "multiple_choice",
    prompt: "What does the | operator do on two bits?",
    options: [
      "1 only when both bits are 1",
      "1 when either bit is 1",
      "1 when the bits differ",
      "Inverts both bits",
    ],
    answer: 1,
    explanation: "OR is the union: either-or-both. It's how you combine flags into a single integer." },

  { id: "t1-xor-def", tier: 1, type: "multiple_choice",
    prompt: "What does the ^ operator do on two bits?",
    options: [
      "1 only when both bits are 1",
      "1 when either bit is 1",
      "1 when the bits differ",
      "Copies the first bit",
    ],
    answer: 2,
    explanation: "XOR is exclusive-or: 1 exactly when the inputs differ. That's why a ^ a === 0 and XOR is its own inverse." },

  { id: "t1-not-def", tier: 1, type: "multiple_choice",
    prompt: "What does the unary ~ operator do?",
    options: [
      "Flips every bit",
      "Zeros the operand",
      "Toggles only the low bit",
      "Returns the absolute value",
    ],
    answer: 0,
    explanation: "~ is a bitwise NOT — every 0 becomes 1 and vice versa. In 32-bit signed arithmetic that means ~n === -(n+1)." },

  { id: "t1-shl-def", tier: 1, type: "multiple_choice",
    prompt: "What does n << k mean for non-negative integers that fit in 32 bits?",
    options: [
      "Divides n by 2^k",
      "Multiplies n by 2^k",
      "Rotates the bits of n by k positions",
      "Zeros the low k bits of n",
    ],
    answer: 1,
    explanation: "Shifting all bits left by k has the same effect as multiplying by 2^k, up until bits spill off the high end." },

  { id: "t1-sizeof-32", tier: 1, type: "multiple_choice",
    prompt: "How many bits does JavaScript use internally for bitwise operations (excluding BigInt)?",
    options: ["8", "16", "32", "64"],
    answer: 2,
    explanation: "JS coerces operands to Int32 before running any bitwise operator. That's why (1 << 31) is negative and (1 << 32) wraps back to 1." },

  { id: "t1-set-has-bit", tier: 1, type: "multiple_choice",
    prompt: "Which expression sets bit k of n to 1, leaving all other bits untouched?",
    options: [
      "n & (1 << k)",
      "n | (1 << k)",
      "n ^ (1 << k)",
      "n & ~(1 << k)",
    ],
    answer: 1,
    explanation: "OR with a one-hot mask forces the target bit on. AND would require the bit to already be 1 elsewhere; XOR toggles; ~mask would clear." },

  { id: "t1-clear-bit", tier: 1, type: "multiple_choice",
    prompt: "Which expression clears bit k of n (forces it to 0)?",
    options: [
      "n | (1 << k)",
      "n ^ (1 << k)",
      "n & ~(1 << k)",
      "n & (1 << k)",
    ],
    answer: 2,
    explanation: "~(1 << k) is a mask with every bit set except at k. AND it in and only that bit is zeroed." },

  { id: "t1-even-check", tier: 1, type: "multiple_choice",
    prompt: "Which expression is true iff n is even?",
    options: [
      "(n & 1) === 0",
      "(n | 1) === 0",
      "(n ^ 1) === 0",
      "(n >> 1) === 0",
    ],
    answer: 0,
    explanation: "The lowest bit tells you parity: 0 for even, 1 for odd. AND with 1 isolates it." },

  { id: "t1-and-zero", tier: 1, type: "true_false",
    prompt: "For any integer n, (n & 0) is always 0.",
    answer: true,
    explanation: "Anything AND 0 is 0 — the mask wipes every bit. It's the cheap way to force a clear." },

  { id: "t1-or-zero", tier: 1, type: "true_false",
    prompt: "For any integer n, (n | 0) is always 0.",
    answer: false,
    explanation: "n | 0 is the canonical 'coerce to Int32' idiom — it preserves the low 32 bits of n, it doesn't zero them." },

  { id: "t1-xor-self", tier: 1, type: "true_false",
    prompt: "For any integer n, (n ^ n) is 0.",
    answer: true,
    explanation: "Every bit XORed with itself is 0. This identity is what makes XOR-swap work." },

  { id: "t1-hex-nibble", tier: 1, type: "multiple_choice",
    prompt: "How many bits is one hex digit worth?",
    options: ["2", "3", "4", "8"],
    answer: 2,
    explanation: "Each hex digit (0–F) represents 4 bits. A byte is two hex digits; 0xFF is 8 bits of 1." },

  { id: "t1-1shl3-eq", tier: 1, type: "multiple_choice",
    prompt: "What is (1 << 3)?",
    options: ["3", "6", "8", "16"],
    answer: 2,
    explanation: "1 << 3 means 'place a 1 at bit position 3', which is 2^3 = 8." },

  { id: "t1-or-flags", tier: 1, type: "multiple_choice",
    prompt: "If READ = 0b001 and WRITE = 0b010, what is READ | WRITE?",
    options: ["0b000", "0b001", "0b010", "0b011"],
    answer: 3,
    explanation: "OR combines the two one-hot flags into a single integer with both bits set — 0b011 === 3." },

  // ============================================================
  // TIER 2 — Recognition: predict the output of a single op
  // ============================================================
  { id: "t2-and-mask-low", tier: 2, type: "predict_bits",
    prompt: "Predict the result of AND-ing with the low-nibble mask.",
    expr: "0b11011010 & 0b00001111",
    width: 8,
    operands: [
      { label: "A", bits: [1,1,0,1,1,0,1,0] },
      { label: "B", bits: [0,0,0,0,1,1,1,1] },
    ],
    expectedBits: [0,0,0,0,1,0,1,0],
    explanation: "AND with 0x0F keeps the low four bits (1010) and zeros the high four. This is the canonical 'extract low byte / nibble' idiom." },

  { id: "t2-or-flags", tier: 2, type: "predict_bits",
    prompt: "Predict the result of OR-ing two bitmaps.",
    expr: "0b10100000 | 0b00001101",
    width: 8,
    operands: [
      { label: "A", bits: [1,0,1,0,0,0,0,0] },
      { label: "B", bits: [0,0,0,0,1,1,0,1] },
    ],
    expectedBits: [1,0,1,0,1,1,0,1],
    explanation: "OR sets any bit present in either operand. The high nibble comes from A, the low from B, and they don't overlap." },

  { id: "t2-xor-basic", tier: 2, type: "predict_bits",
    prompt: "Predict the result of this XOR.",
    expr: "0b11001100 ^ 0b10101010",
    width: 8,
    operands: [
      { label: "A", bits: [1,1,0,0,1,1,0,0] },
      { label: "B", bits: [1,0,1,0,1,0,1,0] },
    ],
    expectedBits: [0,1,1,0,0,1,1,0],
    explanation: "XOR sets each bit where the inputs differ. Positions where both are 1 (or both are 0) give 0; positions where they disagree give 1." },

  { id: "t2-not-8bit", tier: 2, type: "predict_bits",
    prompt: "Predict ~n masked to 8 bits.",
    expr: "(~0b01010101) & 0xFF",
    width: 8,
    operands: [
      { label: "n", bits: [0,1,0,1,0,1,0,1] },
    ],
    expectedBits: [1,0,1,0,1,0,1,0],
    explanation: "~ flips every bit. The raw JS result is -86 (32-bit signed), but masking to 8 bits gives 0xAA — the clean bit-level complement." },

  { id: "t2-shl-3", tier: 2, type: "predict_bits",
    prompt: "Predict the 8-bit result of shifting left by 3.",
    expr: "(0b00010110 << 3) & 0xFF",
    width: 8,
    operands: [
      { label: "n", bits: [0,0,0,1,0,1,1,0] },
    ],
    expectedBits: [1,0,1,1,0,0,0,0],
    explanation: "Every bit slides left by 3. Zeros enter from the right. The high bits of the original that would have shifted past position 7 get masked away." },

  { id: "t2-shr-2", tier: 2, type: "predict_bits",
    prompt: "Predict the 8-bit result of shifting right by 2.",
    expr: "0b10110100 >>> 2",
    width: 8,
    operands: [
      { label: "n", bits: [1,0,1,1,0,1,0,0] },
    ],
    expectedBits: [0,0,1,0,1,1,0,1],
    explanation: "Every bit slides right by 2; zeros enter from the left. The low two bits are discarded. For unsigned 8-bit this is n ÷ 4 (integer)." },

  { id: "t2-set-bit-4", tier: 2, type: "predict_bits",
    prompt: "Predict the result of setting bit 4.",
    expr: "0b10000001 | (1 << 4)",
    width: 8,
    operands: [
      { label: "n", bits: [1,0,0,0,0,0,0,1] },
    ],
    expectedBits: [1,0,0,1,0,0,0,1],
    explanation: "1 << 4 is 0b00010000. OR-ing with n forces bit 4 to 1 and leaves everything else alone." },

  { id: "t2-clear-bit-0", tier: 2, type: "predict_bits",
    prompt: "Predict the result of clearing bit 0.",
    expr: "0b11111111 & ~(1 << 0)",
    width: 8,
    operands: [
      { label: "n", bits: [1,1,1,1,1,1,1,1] },
    ],
    expectedBits: [1,1,1,1,1,1,1,0],
    explanation: "~(1 << 0) is 0xFE (all-ones except at bit 0). AND zeros only bit 0 and leaves the rest." },

  { id: "t2-toggle-bit-2", tier: 2, type: "predict_bits",
    prompt: "Predict the result of toggling bit 2.",
    expr: "0b01010101 ^ (1 << 2)",
    width: 8,
    operands: [
      { label: "n", bits: [0,1,0,1,0,1,0,1] },
    ],
    expectedBits: [0,1,0,1,0,0,0,1],
    explanation: "XOR with a one-hot mask flips exactly that bit. Bit 2 of n was 1, so it becomes 0." },

  { id: "t2-and-result-mc", tier: 2, type: "multiple_choice",
    prompt: "What is 0b1100 & 0b1010?",
    options: ["0b1000", "0b1110", "0b0110", "0b0100"],
    answer: 0,
    explanation: "Only bit 3 is 1 in both operands, so the AND keeps only that bit: 0b1000." },

  { id: "t2-or-result-mc", tier: 2, type: "multiple_choice",
    prompt: "What is 0b1100 | 0b1010?",
    options: ["0b1000", "0b1110", "0b0110", "0b1100"],
    answer: 1,
    explanation: "OR sets any bit present in either input. 0b1100 | 0b1010 = 0b1110." },

  { id: "t2-xor-result-mc", tier: 2, type: "multiple_choice",
    prompt: "What is 0b1100 ^ 0b1010?",
    options: ["0b1000", "0b1110", "0b0110", "0b0000"],
    answer: 2,
    explanation: "XOR sets bits that differ. Bits 3 and 1 of the inputs disagree — result is 0b0110." },

  { id: "t2-1shl-large", tier: 2, type: "multiple_choice",
    prompt: "In 8-bit, what is (1 << 7)?",
    options: ["0b00000001", "0b10000000", "0b11111111", "0b00000000"],
    answer: 1,
    explanation: "Shifting 1 left by 7 places the single 1-bit at position 7, the highest of an 8-bit byte." },

  { id: "t2-and-self", tier: 2, type: "true_false",
    prompt: "For any integer n, (n & n) === n.",
    answer: true,
    explanation: "Every bit of n AND itself is just that bit. AND is idempotent with itself." },

  { id: "t2-or-self", tier: 2, type: "true_false",
    prompt: "For any integer n, (n | n) === n.",
    answer: true,
    explanation: "OR is also idempotent — combining n with itself adds no new bits." },

  { id: "t2-xor-mask", tier: 2, type: "multiple_choice",
    prompt: "What does n ^ 0xFF do to an 8-bit unsigned value n?",
    options: [
      "Sets n to 0xFF",
      "Zeros n",
      "Flips every bit in the low byte",
      "Swaps the high and low nibbles",
    ],
    answer: 2,
    explanation: "XOR with all-1s flips every bit of the operand. It's the masked-width equivalent of ~n." },

  { id: "t2-hex-to-bin", tier: 2, type: "multiple_choice",
    prompt: "What is 0xA5 in binary?",
    options: ["0b10101010", "0b10100101", "0b01011010", "0b10100111"],
    answer: 1,
    explanation: "A = 1010, 5 = 0101. Concatenate high-nibble then low-nibble: 10100101." },

  { id: "t2-bit-is-set", tier: 2, type: "multiple_choice",
    prompt: "For n = 0b10110100, is bit 5 set?",
    options: [
      "Yes — (n & (1 << 5)) is non-zero",
      "No — bit 5 is 0",
      "Can't tell without masking to Int32",
      "Only in BigInt mode",
    ],
    answer: 0,
    explanation: "Reading MSB-first from bit 7: 1,0,1,1,0,1,0,0. Bit 5 is the third from the left, which is 1." },

  // ============================================================
  // TIER 3 — Application: idioms and recognition
  // ============================================================
  { id: "t3-ispow2-identify", tier: 3, type: "identify_lines",
    prompt: "Which line(s) are the core check for 'is n a power of 2'?",
    code: [
      "function isPowerOf2(n) {",
      "  if (n <= 0) return false;",
      "  return (n & (n - 1)) === 0;",
      "}",
    ],
    correctLines: [2],
    explanation: "Subtracting 1 from a power of 2 flips every bit below the lone 1 and clears that 1, so AND gives 0. The guard on line 1 is necessary but isn't the core trick." },

  { id: "t3-popcount-identify", tier: 3, type: "identify_lines",
    prompt: "Which line drives Brian Kernighan's popcount?",
    code: [
      "function popcount(n) {",
      "  let count = 0;",
      "  while (n) {",
      "    n &= n - 1;",
      "    count++;",
      "  }",
      "  return count;",
      "}",
    ],
    correctLines: [3],
    explanation: "n &= n - 1 clears the lowest set bit in one step. The loop runs once per set bit — not once per bit in the integer — which makes popcount proportional to Hamming weight." },

  { id: "t3-swap-identify", tier: 3, type: "identify_lines",
    prompt: "Which line(s) perform the XOR swap?",
    code: [
      "function swap(a, b) {",
      "  a ^= b;",
      "  b ^= a;",
      "  a ^= b;",
      "  return [a, b];",
      "}",
    ],
    correctLines: [1, 2, 3],
    explanation: "All three XOR assignments together perform the swap. Remove any one and the identity breaks — each depends on the previous." },

  { id: "t3-testbit-vs", tier: 3, type: "multiple_choice",
    prompt: "Why write (n & (1 << k)) !== 0 instead of just (n & (1 << k))?",
    options: [
      "The latter returns 2^k for a set bit, not 1 — it's an integer, not a boolean",
      "The latter is slower in V8",
      "They're identical in every respect",
      "The latter can't be used inside an if statement",
    ],
    answer: 0,
    explanation: "When bit k of n is 1, (n & (1 << k)) evaluates to 2^k, not to 1. If you want a clean boolean (e.g., to store in an array of flags), make the comparison explicit." },

  { id: "t3-combine-perms", tier: 3, type: "multiple_choice",
    prompt: "Which expression checks that perms has both READ (0b001) and WRITE (0b010)?",
    options: [
      "(perms & (READ | WRITE)) === (READ | WRITE)",
      "(perms | READ | WRITE) === perms",
      "(perms ^ READ ^ WRITE) === 0",
      "Both A and B are correct",
    ],
    answer: 3,
    explanation: "A: mask with the combined flags and compare equality — explicit. B: OR-ing the flags in is a no-op iff both were already set — terser. Both work; XOR (C) doesn't have the right semantics." },

  { id: "t3-mid-overflow", tier: 3, type: "multiple_choice",
    prompt: "Why do some binary-search implementations use (lo + hi) >>> 1 instead of (lo + hi) >> 1 or (lo + hi) / 2?",
    options: [
      ">>> 1 is the only option that compiles in strict mode",
      ">>> 1 avoids the Int32 overflow-to-negative bug when lo + hi exceeds 2^31 − 1",
      ">>> 1 rounds differently",
      "There is no difference",
    ],
    answer: 1,
    explanation: "In 32-bit arithmetic, lo + hi can overflow into a negative number. >>> 1 treats the result as unsigned, giving the correct midpoint. >> 1 would preserve the broken sign." },

  { id: "t3-mask-clear-nibble", tier: 3, type: "multiple_choice",
    prompt: "Which expression zeroes the high nibble of an 8-bit n?",
    options: ["n & 0x0F", "n | 0x0F", "n ^ 0xF0", "n & 0xF0"],
    answer: 0,
    explanation: "AND with 0x0F (low nibble all-ones) keeps the low four bits and zeros the high four. 0xF0 would do the opposite." },

  { id: "t3-toggle-range", tier: 3, type: "multiple_choice",
    prompt: "Which expression flips the low 4 bits of n (leaving the high bits alone)?",
    options: ["n & 0x0F", "n | 0x0F", "n ^ 0x0F", "n & ~0x0F"],
    answer: 2,
    explanation: "XOR with a mask flips exactly the bits that are 1 in the mask. 0x0F flips the low nibble, leaving the high nibble untouched." },

  { id: "t3-rgb-pack-identify", tier: 3, type: "identify_lines",
    prompt: "Which line packs three 8-bit channels into a 24-bit RGB integer?",
    code: [
      "function pack(r, g, b) {",
      "  return (r << 16) | (g << 8) | b;",
      "}",
    ],
    correctLines: [1],
    explanation: "Each channel is shifted into its byte slot, and OR merges them. Red → high byte, Green → middle, Blue → low." },

  { id: "t3-mask-vs-modulo", tier: 3, type: "true_false",
    prompt: "For non-negative integers, n & 0xFF is equivalent to n % 256.",
    answer: true,
    explanation: "Masking to the low k bits is the same as n mod 2^k for non-negative integers. It's faster — a single AND instead of a division. (For negative n, the two diverge because of sign behavior.)" },

  // ============================================================
  // TIER 4 — Composition: multi-op expressions and behaviors
  // ============================================================
  { id: "t4-extract-byte", tier: 4, type: "predict_bits",
    prompt: "Predict the 8-bit result of extracting the middle byte of a 24-bit RGB value.",
    expr: "(0xCAFE42 >> 8) & 0xFF",
    width: 8,
    expectedBits: [1,1,1,1,1,1,1,0],
    explanation: "Shift down 8 bits to put the green byte in the low position, then mask with 0xFF to keep only those 8 bits. 0xCAFE42 has green = 0xFE = 11111110." },

  { id: "t4-rotate-left-3", tier: 4, type: "predict_bits",
    prompt: "Predict the 8-bit left-rotation of 0b10110000 by 3.",
    expr: "((n << 3) | (n >>> 5)) & 0xFF",
    width: 8,
    operands: [
      { label: "n", bits: [1,0,1,1,0,0,0,0] },
    ],
    expectedBits: [1,0,0,0,0,1,0,1],
    explanation: "Left-rotate is (shift left k) OR (shift right width−k). Top 3 bits 101 come back at the bottom; the rest slides up. Result: 10000101." },

  { id: "t4-clear-then-set", tier: 4, type: "predict_bits",
    prompt: "Predict the result: clear bit 3 of n, then set bit 6.",
    expr: "(0b01001001 & ~(1 << 3)) | (1 << 6)",
    width: 8,
    operands: [
      { label: "n", bits: [0,1,0,0,1,0,0,1] },
    ],
    expectedBits: [0,1,0,0,0,0,0,1],
    explanation: "The clear zeros bit 3 (the 1 becomes 0), then the OR forces bit 6. Bit 6 was already 1, so that OR is a no-op." },

  { id: "t4-compare-isEven", tier: 4, type: "compare",
    prompt: "Which is the cleaner, more idiomatic 'is n even' in JS?",
    optionA: { label: "(n & 1) === 0", curve: (x) => 1 },
    optionB: { label: "n % 2 === 0", curve: (x) => 1 },
    answer: "A",
    explanation: "Both work. But & 1 makes the intent explicit (testing the low bit), is faster on non-negative ints, and — importantly — doesn't round negatives in surprising ways like % can under some interpretations. For positive integers they're equivalent; for bitwise code style, prefer the mask." },

  { id: "t4-compare-isNegative", tier: 4, type: "compare",
    prompt: "Which expression is a robust check for 'is n a negative Int32'?",
    optionA: { label: "n < 0", curve: (x) => 1 },
    optionB: { label: "(n >> 31) !== 0", curve: (x) => 1 },
    answer: "A",
    explanation: "A is simpler and works for any number. B also works (it isolates the sign bit of the 32-bit view), but it's more fragile for values that fall outside Int32 range. Reach for bitwise sign-tests only when you're deliberately working in Int32." },

  { id: "t4-identify-which-clears", tier: 4, type: "identify_lines",
    prompt: "Which line(s) actually modify a bit in n?",
    code: [
      "let n = 0b1010;",
      "const mask = 1 << 2;",
      "const hasBit2 = (n & mask) !== 0;",
      "n = n | mask;",
      "n = n & ~mask;",
      "n = n ^ mask;",
    ],
    correctLines: [3, 4, 5],
    explanation: "Lines 3–5 assign back to n (set, clear, toggle). Line 2 builds a mask (no mutation), and line 2 (hasBit2) reads without mutating. The reassigning lines are the mutations." },

  { id: "t4-unset-low-bits", tier: 4, type: "predict_bits",
    prompt: "Predict n with its low 4 bits cleared.",
    expr: "0b10110101 & ~0x0F",
    width: 8,
    operands: [
      { label: "n", bits: [1,0,1,1,0,1,0,1] },
    ],
    expectedBits: [1,0,1,1,0,0,0,0],
    explanation: "~0x0F is 0xF0 — high nibble on, low nibble off. AND keeps the high nibble unchanged and zeros the low nibble." },

  { id: "t4-swap-low-high-nibble", tier: 4, type: "multiple_choice",
    prompt: "Which expression swaps the high and low nibbles of an 8-bit n?",
    options: [
      "(n >> 4) | (n << 4)",
      "((n << 4) | (n >> 4)) & 0xFF",
      "n ^ 0xFF",
      "(n & 0x0F) | (n & 0xF0)",
    ],
    answer: 1,
    explanation: "Shift low nibble up and high nibble down, OR them together, then mask to 8 bits to drop anything that escaped. Option A works in Int32 but doesn't mask back to 8 bits." },

  { id: "t4-and-with-zero-short", tier: 4, type: "multiple_choice",
    prompt: "What does (n & 0xFF00) tell you about n?",
    options: [
      "Whether n is negative",
      "The high byte of n's low 16 bits, kept in place",
      "Nothing — it's always zero",
      "The popcount of n",
    ],
    answer: 1,
    explanation: "Masking with 0xFF00 isolates bits 8–15 and zeros the rest. The result still occupies those bit positions — if you want the byte's value, shift right by 8." },

  { id: "t4-xor-roundtrip", tier: 4, type: "true_false",
    prompt: "For any integers a and b, ((a ^ b) ^ b) === a.",
    answer: true,
    explanation: "XOR is its own inverse: applying b twice cancels out. This identity is the mathematical basis for XOR swap and for one-time-pad-style encryption." },

  // ============================================================
  // TIER 5 — Traps & Gotchas: JS-specific surprises
  // ============================================================
  { id: "t5-shift-mod-32", tier: 5, type: "multiple_choice",
    prompt: "In JavaScript, what is (1 << 32)?",
    options: ["0", "1", "2147483648", "4294967296"],
    answer: 1,
    explanation: "Shift amounts are taken mod 32. (1 << 32) wraps to (1 << 0), which is 1. Not zero — a classic surprise." },

  { id: "t5-not-zero", tier: 5, type: "multiple_choice",
    prompt: "What is ~0 in JavaScript?",
    options: ["0", "1", "-1", "0xFFFFFFFF"],
    answer: 2,
    explanation: "~ flips every bit of the 32-bit signed representation. All-zeros becomes all-ones, which in two's complement is -1. (~0 >>> 0) would give 4294967295." },

  { id: "t5-1shl31", tier: 5, type: "multiple_choice",
    prompt: "What is (1 << 31) in JavaScript?",
    options: ["2147483648", "-2147483648", "0", "Infinity"],
    answer: 1,
    explanation: "Bit 31 is the sign bit in two's complement. (1 << 31) puts a 1 there and interprets it as a negative number — the most negative Int32." },

  { id: "t5-neg-1-shr", tier: 5, type: "multiple_choice",
    prompt: "What is (-1) >> 1?",
    options: ["-1", "0", "2147483647", "1"],
    answer: 0,
    explanation: "Arithmetic right shift preserves the sign bit. -1 is all-ones; shifting right fills from the left with 1, keeping it all-ones — still -1. Use >>> to get the unsigned view." },

  { id: "t5-neg-1-ushr", tier: 5, type: "multiple_choice",
    prompt: "What is (-1) >>> 0?",
    options: ["-1", "0", "4294967295", "2147483647"],
    answer: 2,
    explanation: "Unsigned right shift by 0 is how you reveal the unsigned 32-bit interpretation. -1's bit pattern is all-ones; read as unsigned, that's 2^32 − 1 = 4294967295." },

  { id: "t5-truncate-negative", tier: 5, type: "multiple_choice",
    prompt: "What is (-3.7) | 0?",
    options: ["-4 (floor)", "-3 (truncate toward zero)", "3", "Throws"],
    answer: 1,
    explanation: "Int32 coercion truncates toward zero — not toward negative infinity. For negative floats this differs from Math.floor. Use Math.trunc for clarity." },

  { id: "t5-bigint-need", tier: 5, type: "true_false",
    prompt: "(1 << 33) is 2 in standard JS number arithmetic.",
    answer: true,
    explanation: "Because shift amounts are mod 32, (1 << 33) is the same as (1 << 1), which is 2. To shift past 32 bits, use BigInt: (1n << 33n) === 8589934592n." },

  { id: "t5-xor-overflow", tier: 5, type: "multiple_choice",
    prompt: "(2 ** 40) ^ 0 in standard JS evaluates to…",
    options: [
      "2 ** 40 (1099511627776)",
      "0",
      "The low 32 bits of 2 ** 40, which is 0",
      "NaN",
    ],
    answer: 2,
    explanation: "XOR coerces to Int32 first, discarding any bits above bit 31. 2 ** 40 has no bits in the low 32, so the Int32 view is 0 — and 0 ^ 0 is 0. Bits above 32 silently disappear." },

  { id: "t5-shr-vs-ushr", tier: 5, type: "compare",
    prompt: "You want to convert the negative Int32 (-42) into its unsigned 32-bit representation. Which expression works?",
    optionA: { label: "(-42) >> 0", curve: (x) => 1 },
    optionB: { label: "(-42) >>> 0", curve: (x) => 1 },
    answer: "B",
    explanation: ">>> 0 is the only JS operator that produces an unsigned 32-bit result. >> 0 preserves the sign — so -42 stays -42. Use >>> 0 to 'show me the raw unsigned bits'." },

  { id: "t5-bigint-noushr", tier: 5, type: "true_false",
    prompt: "BigInt supports the same bitwise operators as regular numbers, including >>>.",
    answer: false,
    explanation: "BigInt supports &, |, ^, ~, <<, and >> — but not >>>. BigInts have no fixed width, so 'unsigned right shift' has no meaning. Use BigInt when you need bitwise ops on values larger than 32 bits." },
];
