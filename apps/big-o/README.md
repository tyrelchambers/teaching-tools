# big-o

Interactive teaching tool for Big-O notation. Vite + React 19 + Tailwind v4. Static SPA, served by nginx in production.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # bundle to dist/
npm run preview  # serve dist/ at http://localhost:4173
```

## Container

```sh
docker build -t ghcr.io/tyrelchambers/big-o:latest .
docker run --rm -p 8080:8080 ghcr.io/tyrelchambers/big-o:latest
```

## Deploy

Image is published to `ghcr.io/tyrelchambers/big-o` by `.github/workflows/big-o-publish.yml` on push to `main`. K8s manifest lives outside this repo at `~/home/k8s/manifests/big-o.yaml`.
