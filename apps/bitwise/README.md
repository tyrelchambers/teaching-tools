# bitwise

Interactive teaching tool for JavaScript bitwise operations — operators, idioms, and the polynomial (GF(2)) view of bits. Vite + React 19 + Tailwind v4. Static SPA, served by nginx in production.

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
docker build -t ghcr.io/tyrelchambers/bitwise:latest .
docker run --rm -p 8080:8080 ghcr.io/tyrelchambers/bitwise:latest
```

## Deploy

Image is published to `ghcr.io/tyrelchambers/bitwise` by `.github/workflows/bitwise-publish.yml` on push to `master`. K8s manifest lives outside this repo at `~/home/k8s/manifests/bitwise.yaml` — create it (Deployment + Service + Ingress for `bitwise.tyrelchambers.com`) before the first deploy; the CI `kubectl rollout restart` step will fail until the resource exists.
