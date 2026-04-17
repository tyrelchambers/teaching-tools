// Idioms: practical bit-manipulation recipes. Each entry has a live mini-example
// driven by the `run(n, k)` function, which returns the integer result rendered
// by a BitGrid. Categories are used for the sidebar grouping.

export const idioms = [
  {
    id: "is-even",
    name: "isEven",
    category: "membership",
    problem: "Check whether an integer is even. The lowest bit carries the parity.",
    code: [
      { line: "const isEven = (n) => (n & 1) === 0;", highlight: true, note: "Bit 0 is 1 for odds, 0 for evens." },
      { line: "", highlight: false },
      { line: "isEven(42);  // true", highlight: false },
      { line: "isEven(7);   // false", highlight: false },
    ],
    run: (n) => ((n & 1) === 0 ? 1 : 0),
    runLabel: "1 if even, 0 if odd",
    defaultN: 42,
  },
  {
    id: "is-power-of-2",
    name: "isPowerOf2",
    category: "membership",
    problem:
      "Check whether n is a power of 2. Powers of 2 have exactly one bit set — AND-ing with n-1 clears it.",
    code: [
      { line: "const isPowerOf2 = (n) => n > 0 && (n & (n - 1)) === 0;", highlight: true, note: "Subtracting 1 flips every bit below the lone 1, then AND zeros the lot." },
      { line: "", highlight: false },
      { line: "isPowerOf2(16);  // true  (0b10000 & 0b01111 === 0)", highlight: false },
      { line: "isPowerOf2(20);  // false (0b10100 & 0b10011 === 0b10000)", highlight: false },
    ],
    run: (n) => (n > 0 && (n & (n - 1)) === 0 ? 1 : 0),
    runLabel: "1 if power of 2",
    defaultN: 16,
  },
  {
    id: "set-bit",
    name: "setBit",
    category: "bit manipulation",
    problem: "Force bit k to 1 without touching the others. OR with a one-hot mask.",
    code: [
      { line: "const setBit = (n, k) => n | (1 << k);", highlight: true, note: "1 << k is the one-hot mask; OR sets the bit if it wasn't already." },
      { line: "", highlight: false },
      { line: "setBit(0b0100, 0);  // 0b0101", highlight: false },
    ],
    run: (n, k = 2) => n | (1 << k),
    runLabel: "n with bit k set",
    defaultN: 0b01000001,
    defaultK: 4,
  },
  {
    id: "clear-bit",
    name: "clearBit",
    category: "bit manipulation",
    problem: "Force bit k to 0. AND with the inverse of a one-hot mask.",
    code: [
      { line: "const clearBit = (n, k) => n & ~(1 << k);", highlight: true, note: "~(1 << k) is all-ones except at k." },
      { line: "", highlight: false },
      { line: "clearBit(0b1111, 1);  // 0b1101", highlight: false },
    ],
    run: (n, k = 2) => n & ~(1 << k),
    runLabel: "n with bit k cleared",
    defaultN: 0b11111111,
    defaultK: 3,
  },
  {
    id: "toggle-bit",
    name: "toggleBit",
    category: "bit manipulation",
    problem: "Flip bit k. XOR with a one-hot mask — the whole point of XOR.",
    code: [
      { line: "const toggleBit = (n, k) => n ^ (1 << k);", highlight: true, note: "Running toggle twice with the same k returns n." },
      { line: "", highlight: false },
      { line: "toggleBit(0b0100, 2);  // 0b0000", highlight: false },
      { line: "toggleBit(0b0000, 2);  // 0b0100", highlight: false },
    ],
    run: (n, k = 2) => n ^ (1 << k),
    runLabel: "n with bit k toggled",
    defaultN: 0b01010101,
    defaultK: 2,
  },
  {
    id: "test-bit",
    name: "testBit",
    category: "bit manipulation",
    problem:
      "Check whether bit k is 1. AND with the mask and compare to zero — don't return (n & mask) alone, because that returns 2^k, not 1.",
    code: [
      { line: "const testBit = (n, k) => (n & (1 << k)) !== 0;", highlight: true, note: "Explicit !== 0 gives a clean boolean." },
      { line: "", highlight: false },
      { line: "testBit(0b1010, 1);  // true", highlight: false },
      { line: "testBit(0b1010, 2);  // false", highlight: false },
    ],
    run: (n, k = 1) => ((n & (1 << k)) !== 0 ? 1 : 0),
    runLabel: "1 if bit k is set",
    defaultN: 0b10101010,
    defaultK: 5,
  },
  {
    id: "xor-swap",
    name: "XOR swap",
    category: "swap",
    problem:
      "Swap two integers without a temporary. Three XORs do it because XOR is its own inverse.",
    code: [
      { line: "let a = 5, b = 9;", highlight: false },
      { line: "a ^= b;  // a = a ^ b", highlight: true, note: "Now a holds the XOR of the originals." },
      { line: "b ^= a;  // b = b ^ (a ^ b) = a", highlight: true, note: "Cancellation gives b the original a." },
      { line: "a ^= b;  // a = (a ^ b) ^ a = b", highlight: true, note: "Cancellation gives a the original b." },
      { line: "// a === 9, b === 5", highlight: false },
    ],
    run: (n) => {
      let a = n, b = 0xa5;
      a ^= b; b ^= a; a ^= b;
      return a;
    },
    runLabel: "the swapped 'a' (b starts as 0xA5)",
    defaultN: 0x5a,
  },
  {
    id: "popcount",
    name: "popcount (Hamming weight)",
    category: "counting",
    problem:
      "Count the number of 1-bits. Brian Kernighan's trick: n & (n-1) clears the lowest set bit; repeat until zero.",
    code: [
      { line: "function popcount(n) {", highlight: false },
      { line: "  let count = 0;", highlight: false },
      { line: "  while (n) {", highlight: true, note: "Loops once per set bit, not once per bit width." },
      { line: "    n &= n - 1;", highlight: true, note: "Clears the lowest set bit." },
      { line: "    count++;", highlight: false },
      { line: "  }", highlight: false },
      { line: "  return count;", highlight: false },
      { line: "}", highlight: false },
    ],
    run: (n) => {
      let x = n, c = 0;
      while (x) { x &= x - 1; c++; }
      return c;
    },
    runLabel: "count of 1 bits in n",
    defaultN: 0b10110111,
  },
  {
    id: "truncate",
    name: "n | 0 — truncate to Int32",
    category: "truncation",
    problem:
      "Coerce a number to its 32-bit signed integer form, dropping any fractional part (toward zero).",
    code: [
      { line: "3.9 | 0      // 3", highlight: true, note: "Floor for positives." },
      { line: "(-3.9) | 0   // -3", highlight: true, note: "Trunc toward zero — not Math.floor!" },
      { line: "(2 ** 31) | 0   // -2147483648", highlight: true, note: "Overflows into the sign bit." },
      { line: "(2 ** 32) | 0   // 0", highlight: false },
      { line: "", highlight: false },
      { line: "// Modern code prefers Math.trunc — clearer intent.", highlight: false },
    ],
    run: (n) => n | 0,
    runLabel: "n | 0 (masked to 8 bits for display)",
    defaultN: 0b11001100,
  },
  {
    id: "rotate-left",
    name: "rotateLeft",
    category: "rotation",
    problem:
      "Cycle bits left by k — bits that fall off the top re-enter at the bottom. JS has no native rotate; build it from shifts.",
    code: [
      { line: "const rotl8 = (n, k) => {", highlight: false },
      { line: "  k &= 7;", highlight: true, note: "Normalize — same bit pattern after width rotations." },
      { line: "  return ((n << k) | (n >>> (8 - k))) & 0xFF;", highlight: true, note: "Left half shifted out, right half re-entering." },
      { line: "};", highlight: false },
      { line: "", highlight: false },
      { line: "rotl8(0b10110000, 3);  // 0b10000101", highlight: false },
    ],
    run: (n, k = 3) => {
      const s = ((k % 8) + 8) % 8;
      return ((n << s) | (n >>> (8 - s))) & 0xff;
    },
    runLabel: "n rotated left by k (8-bit)",
    defaultN: 0b10110000,
    defaultK: 3,
  },
  {
    id: "rgb-pack",
    name: "pack / unpack RGB",
    category: "packing",
    problem:
      "Pack three 8-bit channels into a single 24-bit integer, and unpack with mask + shift.",
    code: [
      { line: "const pack = (r, g, b) => (r << 16) | (g << 8) | b;", highlight: true, note: "Shift each channel into place, OR them together." },
      { line: "const red   = (rgb) => (rgb >> 16) & 0xFF;", highlight: true, note: "Shift down, mask off the 8 low bits." },
      { line: "const green = (rgb) => (rgb >>  8) & 0xFF;", highlight: false },
      { line: "const blue  = (rgb) => (rgb      ) & 0xFF;", highlight: false },
      { line: "", highlight: false },
      { line: "pack(0xCA, 0xFE, 0x42).toString(16);  // 'cafe42'", highlight: false },
    ],
    run: (n) => ((n & 0xff) << 16) | ((n & 0xff) << 8) | (n & 0xff), // show 3x the byte packed
    runLabel: "n packed as R=G=B (display masked to 8 bits)",
    defaultN: 0xa7,
  },
  {
    id: "int32-coercion",
    name: "32-bit coercion",
    category: "gotchas",
    problem:
      "Every bitwise operator (except BigInt variants) converts its operands to Int32. This is the source of the weirdest bugs.",
    code: [
      { line: "2 ** 32           // 4294967296", highlight: false },
      { line: "(2 ** 32) | 0     // 0 — overflowed past 32 bits", highlight: true, note: "Bits 32+ disappear." },
      { line: "(2 ** 31) | 0     // -2147483648 — becomes the sign bit", highlight: true, note: "High bit set = negative number." },
      { line: "", highlight: false },
      { line: "// When you need more than 32 bits, use BigInt:", highlight: false },
      { line: "(1n << 40n)       // 1099511627776n", highlight: true, note: "BigInt bitwise works without width limit. Note the 'n' suffix on literals." },
      { line: "(1n << 40n) & 0xFFn  // 0n", highlight: false },
    ],
    run: (n) => (n | 0) & 0xff,
    runLabel: "(n | 0) on 8-bit view",
    defaultN: 0b10000001,
  },
];
