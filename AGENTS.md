# OpenOrca Agent Guide

> Table of contents for agents working in this repository.
> Keep this under 100 lines. Details live in docs/.

---

## Quick Context

**OpenOrca** is a command center for managing AI agent fleets.
- Frontend: React 19 + TypeScript + Tailwind
- Backend: Node.js + Express + WebSocket
- Database: PostgreSQL (Drizzle ORM)
- Knowledge: TrustGraph (Cassandra + Qdrant)

## Repository Map

```
openorca/
├── client/              → React frontend
│   ├── src/components/  → UI components
│   ├── src/lib/         → Data models, utilities
│   └── src/pages/       → Route pages
├── server/              → Express backend
│   ├── knowledge/       → TrustGraph integration
│   └── routes.ts        → API endpoints
├── shared/              → Shared types
├── docs/                → Documentation (see below)
└── docker-compose.yml   → Full stack deployment
```

## Documentation Index

| Path | Purpose |
|------|---------|
| `docs/architecture/` | System design, layer model |
| `docs/api/` | API contracts, endpoints |
| `docs/knowledge/` | TrustGraph integration |
| `TRUSTGRAPH_INTEGRATION.md` | Knowledge layer architecture |

## Architecture Rules

**Layer model (dependencies flow forward only):**
```
Types → Config → Repo → Service → Runtime → UI
```

**Key constraints:**
1. Validate data at boundaries (parse, don't validate)
2. Structured logging required (no console.log)
3. API routes return typed responses
4. Components under 300 lines
5. All external calls through service layer

## Before You Code

1. Check `docs/plans/active/` for current work
2. Read relevant architecture doc
3. Run `npm run lint` to understand constraints
4. Query TrustGraph for domain context

## Key Files

| File | When to Read |
|------|--------------|
| `client/src/lib/clawData.ts` | Agent/Task/Swarm types |
| `server/knowledge/types.ts` | Knowledge graph types |
| `server/routes.ts` | API endpoint patterns |
| `docker-compose.yml` | Service dependencies |

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 5000)
npm run lint         # Check code style
npm run db:push      # Sync database schema
docker compose up    # Start full stack with TrustGraph
```

## Golden Principles

1. **Repository is truth** — If it's not here, agents can't use it
2. **Legibility > cleverness** — Optimize for agent comprehension
3. **Boundaries are sacred** — Layer violations break everything
4. **Fast feedback** — Small PRs, quick merges, fix forward
5. **Debt is expensive** — Clean up continuously

## Economic Context

Agents in this system may operate under economic constraints:
- Token costs tracked per action
- Quality determines earnings
- Survival requires positive balance

When working on agent-related code, consider economic impact.

## Getting Help

- Architecture questions → `docs/architecture/`
- API questions → `docs/api/`
- Knowledge questions → `docs/knowledge/`
- Still stuck → Create issue with context

---

*This file is the map. The territory is in docs/.*
