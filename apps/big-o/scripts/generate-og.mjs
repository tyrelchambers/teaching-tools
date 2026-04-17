// Generates public/og.png at build time using Satori (HTML/CSS → SVG) + Resvg (SVG → PNG).
// Design mirrors the BigOTeacher app: stone-950 bg, Fraunces italic title with red accented "O",
// JetBrains Mono body, complexity-class labels color-coded with the same palette as the curves.

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

// Same palette as complexities[] in BigOTeacher.jsx
const classes = [
  { label: "O(1)", color: "#10b981" },
  { label: "O(log n)", color: "#06b6d4" },
  { label: "O(n)", color: "#eab308" },
  { label: "O(n log n)", color: "#f97316" },
  { label: "O(n\u00b2)", color: "#ef4444" },
  { label: "O(2^n)", color: "#a855f7" },
];

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
            { type: "span", props: { children: "/* chapter 01 */" } },
            {
              type: "span",
              props: {
                style: {
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: "16px",
                  color: "#57534e",
                },
                children: "algorithmic complexity",
              },
            },
          ],
        },
      },
      // Title + tagline
      {
        type: "div",
        props: {
          style: { display: "flex", flexDirection: "column", gap: "32px" },
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
                  fontSize: "150px",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                },
                children: [
                  { type: "span", props: { children: "Big" } },
                  {
                    type: "span",
                    props: {
                      style: { color: "#ef4444", padding: "0 0.18em" },
                      children: "O",
                    },
                  },
                  { type: "span", props: { children: "Notation" } },
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
                  maxWidth: "960px",
                },
                children:
                  "A way to describe how an algorithm's runtime grows as its input grows. Not stopwatch seconds \u2014 the shape of the growth.",
              },
            },
          ],
        },
      },
      // Footer: complexity classes + url
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
                style: { display: "flex", gap: "24px", fontSize: "20px" },
                children: classes.map((c) => ({
                  type: "span",
                  props: { style: { color: c.color }, children: c.label },
                })),
              },
            },
            {
              type: "div",
              props: {
                style: { color: "#57534e", fontSize: "18px" },
                children: "// big-o.tyrelchambers.com //",
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
