# AI-Company

An intelligent AI agent orchestration platform with a dark-themed dashboard, multi-model AI provider support, and a modular agent system.

## Architecture

```
ai-company/
  apps/
    dashboard/     # React + Vite + Tailwind v4 frontend
    server/        # Express + WebSocket backend API
  agents/          # AI agent implementations (Owner, Planner, Orchestrator)
  packages/
    api/           # API client library with React hooks
    backend/       # Backend services & middleware
    database/      # SQLite database layer (better-sqlite3)
    frontend/      # Frontend utilities & hooks
    orchestrator/  # Task orchestration & agent management
    shared/        # Shared types, constants & utilities
    ui/            # Reusable UI components
```

## Getting Started

1. Copy `.env.example` to `.env` and fill in your API keys
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

This runs both the server (port 3001) and dashboard (port 5173) concurrently.

## Scripts

- `npm run dev` — Start dev servers (dashboard + server)
- `npm run build` — Build server then dashboard
- `npm run start` — Start production server

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React
- **Backend**: Express 5, WebSocket (ws), SQLite (better-sqlite3)
- **Language**: TypeScript 6 (ES2022, NodeNext)
- **AI Providers**: OpenAI, Anthropic, Google (pluggable)

## Screens

- Login — Animated auth with particle canvas & OAuth
- Workspace — Agent flow diagram, chat panel, terminal
- Task Board — Kanban with drag-and-drop
- File Explorer — Collapsible file tree
- Activity Timeline — Chronological event feed
- Settings — Model provider configuration
- Agent IDE — Full simulated agent workflow
