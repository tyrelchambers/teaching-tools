# teaching-tools

Collection of standalone teaching mini-apps. Each app under `apps/<name>/` is fully self-contained — its own `package.json`, dependencies, Dockerfile, and CI workflow. No workspace tooling.

## Apps

| App | Description | Live |
|---|---|---|
| [`apps/big-o`](apps/big-o) | Interactive Big-O notation teaching tool | https://big-o.tyrelchambers.com |

## Adding a new app

1. Create `apps/<name>/` with its own `package.json` and Dockerfile.
2. Add a publish workflow at `.github/workflows/<name>-publish.yml` (path-filtered to `apps/<name>/**`).
3. Add a k8s manifest at `~/home/k8s/manifests/<name>.yaml`.
