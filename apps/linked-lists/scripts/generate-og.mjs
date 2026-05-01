// Generates public/og.png at build time using Satori (HTML/CSS → SVG) + Resvg (SVG → PNG).
// Design mirrors LinkedListsTeacher: stone-950 bg, Fraunces italic title with emerald "L"
// accent, JetBrains Mono body, a row of node boxes drawn directly in JSX-like syntax.

import { Resvg } from "@resvg/resvg-js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "public", "og.png");

async function loadFont(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url} (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

const [jetbrainsMono, frauncesItalic] = await Promise.all([
  loadFont("https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff"),
  loadFont("https://cdn.jsdelivr.net/npm/@fontsource/fraunces/files/fraunces-latin-700-italic.woff"),
]);

// Helper to render a single linked-list node box.
function nodeBox({ value, color = "#e7e5e4", border = "#44403c" }) {
  return {
    type: "div",
    props: {
      style: {
        width: 90,
        height: 60,
        borderRadius: 8,
        border: `1.5px solid ${border}`,
        background: "#1c1917",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        color,
        fontFamily: "JetBrains Mono",
      },
      children: String(value),
    },
  };
}

function arrow(color = "#a8a29e") {
  return {
    type: "div",
    props: {
      style: {
        width: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        color,
      },
      children: "→",
    },
  };
}

function pointerChip({ label, color }) {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: -34,
        left: 0,
        width: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "JetBrains Mono",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              padding: "2px 10px",
              borderRadius: 999,
              border: `1px solid ${color}`,
              background: `${color}33`,
              color,
              fontSize: 12,
            },
            children: label,
          },
        },
        {
          type: "div",
          props: {
            style: { width: 1, height: 8, background: color },
            children: "",
          },
        },
      ],
    },
  };
}

function nodeWithPointer({ value, pointerLabel, pointerColor, accent }) {
  return {
    type: "div",
    props: {
      style: { position: "relative", display: "flex" },
      children: [
        pointerLabel ? pointerChip({ label: pointerLabel, color: pointerColor }) : null,
        nodeBox({
          value,
          color: accent ? pointerColor : "#e7e5e4",
          border: accent ? pointerColor : "#44403c",
        }),
      ].filter(Boolean),
    },
  };
}

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
            { type: "span", props: { children: "/* chapter 03 */" } },
            {
              type: "span",
              props: {
                style: {
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: "16px",
                  color: "#57534e",
                },
                children: "data structures",
              },
            },
          ],
        },
      },
      // Title + tagline
      {
        type: "div",
        props: {
          style: { display: "flex", flexDirection: "column", gap: "28px" },
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
                  fontSize: "140px",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                },
                children: [
                  { type: "span", props: { children: "Linked" } },
                  {
                    type: "span",
                    props: {
                      style: { color: "#10b981", padding: "0 0.18em" },
                      children: "L",
                    },
                  },
                  { type: "span", props: { children: "ists" } },
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
                  "Pointers, traced step by step. Dummy heads, two-pointer walks, reversals, cycles — every technique stepped through frame by frame.",
              },
            },
          ],
        },
      },
      // Mini diagram: head → 1 → 2 → 3 → 4 → ∅, with `slow` chip on 2 and `fast` on 4.
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            paddingTop: 40,
          },
          children: [
            nodeWithPointer({ value: "1", pointerLabel: "head", pointerColor: "#10b981", accent: true }),
            arrow(),
            nodeWithPointer({ value: "2", pointerLabel: "slow", pointerColor: "#a855f7", accent: false }),
            arrow(),
            nodeWithPointer({ value: "3", pointerLabel: null }),
            arrow(),
            nodeWithPointer({ value: "4", pointerLabel: "fast", pointerColor: "#ec4899", accent: false }),
            arrow("#57534e"),
            {
              type: "div",
              props: {
                style: { color: "#78716c", fontSize: 26, fontFamily: "JetBrains Mono" },
                children: "∅",
              },
            },
          ],
        },
      },
      // Footer
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #292524",
            paddingTop: "24px",
            fontSize: "18px",
          },
          children: [
            {
              type: "div",
              props: {
                style: { display: "flex", gap: 24, color: "#a8a29e" },
                children: [
                  { type: "span", props: { style: { color: "#10b981" }, children: "dummy head" } },
                  { type: "span", props: { style: { color: "#a855f7" }, children: "slow / fast" } },
                  { type: "span", props: { style: { color: "#f59e0b" }, children: "reverse" } },
                  { type: "span", props: { style: { color: "#ec4899" }, children: "cycle" } },
                ],
              },
            },
            {
              type: "div",
              props: {
                style: { color: "#57534e" },
                children: "// linked-lists.tyrelchambers.com //",
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
console.log(`✓ generated og.png (${(png.length / 1024).toFixed(1)} KB)`);
