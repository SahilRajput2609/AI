# API Overview

The AI Agency exposes a REST API at `/api/*` and a WebSocket endpoint for real-time events.

## Endpoints

### Status
- `GET /api/status` — Server health and agent list

### Tasks
- `GET /api/tasks` — List all tasks
- `POST /api/tasks` — Create a task
- `GET /api/tasks/:id` — Get task details
- `POST /api/tasks/:id/review` — Approve/reject a task

### Plans
- `GET /api/plans` — List all plans
- `POST /api/plans` — Create a plan
- `POST /api/plans/:id/subtasks` — Add a subtask
- `POST /api/plans/:id/finalize` — Finalize a plan

### Agents
- `GET /api/agents` — List all agents
- `GET /api/agents/:role` — Get agent details
- `POST /api/dispatch/:agentRole` — Dispatch action to an agent

### Orchestrator
- `GET /api/orchestrator/state` — Queue state
- `POST /api/orchestrator/dispatch` — Trigger dispatch

### Files
- `GET /api/files?projectId=xxx` — List files
- `GET /api/files/:id` — Get file details

### Activities
- `GET /api/activities?limit=50` — List recent activities

### Agent Configs
- `GET /api/agent-configs` — List configs
- `PUT /api/agent-configs/:role` — Upsert config
- `GET /api/agent-configs/:role` — Get config

### Model Providers
- `GET /api/model-providers` — List providers
- `POST /api/model-providers` — Create provider
- `PUT /api/model-providers/:id` — Update provider
- `DELETE /api/model-providers/:id` — Delete provider
