# Architecture Overview

## System Design

The AI Agency is a multi-agent development platform built as a monorepo.

```
┌─────────────────┐     ┌──────────────────┐
│   Dashboard     │     │   Server (API)    │
│  (Vite + React) │◄───►│  (Express + WS)   │
└─────────────────┘     └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     Agent Manager        │
                    │  (Orchestrator Layer)    │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
        ┌──────────┐      ┌──────────┐      ┌──────────┐
        │  Owner   │      │ Planner  │      │ Agents...│
        │  Agent   │      │  Agent   │      │ (9 more) │
        └──────────┘      └──────────┘      └──────────┘
```

## Tech Stack
- **Frontend**: React 19, Vite 8, Tailwind 4, Lucide icons
- **Backend**: Express 5, WebSocket (ws)
- **Database**: SQLite via better-sqlite3
- **Language**: TypeScript 6 (strict mode)
- **Testing**: Vitest + Testing Library
- **Monorepo**: npm workspaces
