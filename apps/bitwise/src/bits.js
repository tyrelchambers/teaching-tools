// Pure bit helpers. Always operate on integers; derive bit arrays only at render time.
// Bit arrays are MSB-first, length = width. JS coerces operands to 32-bit signed ints
// for all bitwise ops except BigInt; we mask to `width` bits where we want a clean
// unsigned view (e.g., rendering ~ on an 8-bit grid).

export const MASK = (width) => (width >= 32 ? 0xffffffff : (1 << width) - 1) >>> 0;

export function toBits(n, width = 8) {
  const m = MASK(width);
  const u = (n >>> 0) & m;
  const bits = new Array(width);
  for (let i = 0; i < width; i++) bits[i] = (u >>> (width - 1 - i)) & 1;
  return bits;
}

export function fromBits(bits) {
  let n = 0;
  for (let i = 0; i < bits.length; i++) n = (n << 1) | (bits[i] & 1);
  return n >>> 0;
}

export function toHex(n, width = 8) {
  const m = MASK(width);
  const chars = Math.max(2, Math.ceil(width / 4));
  return "0x" + ((n >>> 0) & m).toString(16).padStart(chars, "0").toUpperCase();
}

export function toBin(n, width = 8) {
  const m = MASK(width);
  return "0b" + ((n >>> 0) & m).toString(2).padStart(width, "0");
}

export function toDec(n, width = 8) {
  // Always show the unsigned decimal form of the low `width` bits.
  const m = MASK(width);
  return String((n >>> 0) & m);
}

// Signed decimal interpretation (two's complement). For width=8, 0xFF -> -1.
export function toSignedDec(n, width = 8) {
  const m = MASK(width);
  const u = (n >>> 0) & m;
  const sign = 1 << (width - 1);
  return u & sign ? u - (1 << width) : u;
}

export const and = (a, b) => (a & b) >>> 0;
export const or = (a, b) => (a | b) >>> 0;
export const xor = (a, b) => (a ^ b) >>> 0;
export const not = (n, width = 8) => (~n) & MASK(width);
export const shl = (n, k, width = 8) => ((n << k) >>> 0) & MASK(width);
export const shr = (n, k, width = 8) => ((n >>> 0) & MASK(width)) >> k; // arithmetic shift on the unsigned view == logical shift
export const ushr = (n, k, width = 8) => ((n >>> 0) & MASK(width)) >>> k;

// Popcount (Hamming weight).
export function popcount(n) {
  let x = n >>> 0;
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >>> 24;
}

export const isPowerOf2 = (n) => n > 0 && (n & (n - 1)) === 0;

// Bit <-> polynomial: bit at MSB position i in a width-N array corresponds to power (N-1-i).
// Return terms ordered by descending power (canonical form).
export function bitsToPolynomial(bits) {
  const w = bits.length;
  const terms = [];
  for (let i = 0; i < w; i++) {
    if (bits[i]) terms.push({ power: w - 1 - i, index: i });
  }
  return terms;
}

// Rotate-left on `width` bits.
export function rol(n, k, width = 8) {
  const m = MASK(width);
  const u = (n >>> 0) & m;
  const s = ((k % width) + width) % width;
  return (((u << s) | (u >>> (width - s))) & m) >>> 0;
}
