# Typocalypse Tandem — Backend

NestJS REST API for the Typocalypse Tandem project.

## Prerequisites

- Node.js 22 (use `.nvmrc`: `nvm use` at repo root)
- npm 10+
- Docker + Docker Compose (optional, for containerized runs)

## Getting started

```bash
npm install
npm run start:dev
```

The API starts on `http://localhost:3000` by default.

## Health check

```bash
curl http://localhost:3000/health
# {"status":"ok","info":{},"error":{},"details":{}}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled output |
| `npm run test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run test:cov` | Coverage report |
| `npm run lint` | Lint and auto-fix |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting (CI) |

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
curl http://localhost:3000/health
```

To stop:

```bash
docker compose down
```
