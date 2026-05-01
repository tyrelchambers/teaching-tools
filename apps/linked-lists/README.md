# linked-lists

Interactive teaching tool for singly, doubly, and circular linked lists — fundamentals, classic interview techniques (dummy head, two-pointer, reverse, merge, Floyd's cycle, palindrome, Nth-from-end, add-two-numbers), step-through visualizations, a free-form sandbox, and quizzes. Vite + React 19 + Tailwind v4. Static SPA, served by nginx in production.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # bundle to dist/ (runs prebuild OG generation first)
npm run preview  # serve dist/ at http://localhost:4173
npm run og       # regenerate public/og.png only
```

## Container

```sh
docker build -t ghcr.io/tyrelchambers/linked-lists:latest .
docker run --rm -p 8080:8080 ghcr.io/tyrelchambers/linked-lists:latest
```

## Deploy

Image is published to `ghcr.io/tyrelchambers/linked-lists` by `.github/workflows/linked-lists-publish.yml` on push to `master`. K8s manifest lives outside this repo at `~/home/k8s/manifests/linked-lists.yaml` — create it (Deployment + Service + Ingress for `linked-lists.tyrelchambers.com`) before the first deploy; the CI `kubectl rollout restart` step will fail until the resource exists.

## Architecture

- `src/lib/linkedList.js` — Node model, `fromArray` / `toArray` / `length` / `nodeAt` / `tail` / `forEach` helpers.
- `src/lib/trace.js` — `createTrace()` records frames as the algorithm runs. Each runner mutates real Node objects and snapshots their state at meaningful steps.
- `src/components/LinkedListDiagram.jsx` — SVG renderer. Stable React keys (node `id`) + CSS `transform` transitions give pointer chips and reordering nodes a smooth animated feel.
- `src/components/CodePanel.jsx` / `StepControls.jsx` — code listing with active-line highlight; play/pause/scrub/speed controls.
- `src/components/Sandbox.jsx` — live, mutating linked-list playground that uses the same diagram.
- `src/data/techniques.js` — registry of step-through demos. Adding a technique = one runner + one annotated code listing.
- `src/data/concepts.js`, `quiz.js`, `patterns.js` — Learn / Practice / Pattern mode content.
- `src/modes/*.jsx` — one component per top-level mode tab.
- `src/LinkedListsTeacher.jsx` — shell + mode tabs + footer links to sibling teaching tools.
