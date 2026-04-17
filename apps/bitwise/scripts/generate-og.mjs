// Generates public/og.png at build time using Satori (HTML/CSS → SVG) + Resvg (SVG → PNG).
// Design mirrors the BitwiseTeacher app: stone-950 bg, Fraunces italic title with amber "&",
// JetBrains Mono body, operator labels color-coded.

import { Resvg } from "@resvg/resvg-js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "public", "og.png");

// Satori parses TTF, OTF, and WOFF (not WOFF2). @fontsource ships WOFF on jsDelivr.
async function loadFont(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url} (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

const [jetbrainsMono, frauncesItalic] = await Promise.all([
  loadFont("https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff"),
  loadFont("https://cdn.jsdelivr.net/npm/@fontsource/fraunces/files/fraunces-latin-700-italic.woff"),
]);

// Operator chips for the footer, tinted with the amber accent family.
const ops = [
  { label: "&",   color: "#fbbf24" },
  { label: "|",   color: "#fbbf24" },
  { label: "^",   color: "#fbbf24" },
  { label: "~",   color: "#fbbf24" },
  { label: "<<",  color: "#fbbf24" },
  { label: ">>",  color: "#fbbf24" },
  { label: ">>>", color: "#fbbf24" },
];

// A small 8-bit row of alternating 0/1 cells for visual texture.
const bitPattern = [1, 0, 1, 1, 0, 1, 0, 1];
const bitRow = {
  type: "div",
  props: {
    style: { display: "flex", gap: "6px" },
    children: bitPattern.map((b) => ({
      type: "div",
      props: {
        style: {
          width: "44px", height: "44px",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: b ? "1px solid #fbbf24" : "1px solid #44403c",
          background: b ? "rgba(251, 191, 36, 0.15)" : "transparent",
          color: b ? "#fbbf24" : "#57534e",
          fontSize: "22px",
          fontFamily: "JetBrains Mono",
          fontWeight: 600,
        },
        children: String(b),
      },
    })),
  },
};

const node = {
  type: "div",
  props: {
    style: {
      width: "1200px",
      height: "630px",
      background: "#0c0a09",
      color: "#e7e5e4",
      padding: "64px 80px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      fontFamily: "JetBrains Mono",
    },
    children: [
      // Eyebrow
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
            color: "#78716c",
            fontSize: "22px",
          },
          children: [
            { type: "span", props: { children: "/* chapter 02 */" } },
            {
              type: "span",
              props: {
                style: {
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: "16px",
                  color: "#57534e",
                },
                children: "bitwise operations",
              },
            },
          ],
        },
      },
      // Title + tagline + bit row
      {
        type: "div",
        props: {
          style: { display: "flex", flexDirection: "column", gap: "24px" },
          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "baseline",
                  fontFamily: "Fraunces",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: "170px",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                },
                children: [
                  { type: "span", props: { children: "Bit" } },
                  {
                    type: "span",
                    props: {
                      style: { color: "#fbbf24", padding: "0 0.08em" },
                      children: "&",
                    },
                  },
                  { type: "span", props: { children: "wise" } },
                ],
              },
            },
            {
              type: "div",
              props: {
                style: {
                  fontSize: "26px",
                  color: "#a8a29e",
                  lineHeight: 1.45,
                  maxWidth: "920px",
                },
                children:
                  "Integers as bits, bits as polynomials. Click around, watch it snap into place.",
              },
            },
            bitRow,
          ],
        },
      },
      // Footer: operator chips + url
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #292524",
            paddingTop: "28px",
          },
          children: [
            {
              type: "div",
              props: {
                style: { display: "flex", gap: "20px", fontSize: "22px" },
                children: ops.map((o) => ({
                  type: "span",
                  props: { style: { color: o.color, fontWeight: 600 }, children: o.label },
                })),
              },
            },
            {
              type: "div",
              props: {
                style: { color: "#57534e", fontSize: "18px" },
                children: "// bitwise.tyrelchambers.com //",
              },
            },
          ],
        },
      },
    ],
  },
};

const svg = await satori(node, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "JetBrains Mono", data: jetbrainsMono, weight: 500, style: "normal" },
    { name: "Fraunces", data: frauncesItalic, weight: 700, style: "italic" },
  ],
});

const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, png);
console.log(`\u2713 generated og.png (${(png.length / 1024).toFixed(1)} KB)`);
