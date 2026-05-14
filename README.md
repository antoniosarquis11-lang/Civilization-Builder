# Civilization Builder v1

A React/Vite static web app where users create a fictional country, choose policies, and simulate 50 years of development.

## Netlify deploy settings

Build command:

```bash
npm install --no-audit --no-fund && npm run build
```

Publish directory:

```txt
dist
```

This version intentionally does not include `package-lock.json`, `node_modules`, or `dist`. Netlify will install dependencies during deployment.
