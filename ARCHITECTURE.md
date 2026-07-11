# AI-Company Architecture

## System Overview

AI-Company is a full-stack SaaS platform that orchestrates autonomous AI agents to execute complete software development projects. The system decomposes user requests into specialized subtasks and distributes work across 12+ specialized AI agents.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser (React)                     │
│  Dashboard, Agent IDE, Kanban, Timeline, Project Manager    │
└────────────────────┬────────────────────────────────────────┘
                     │ WebSocket (Real-time)
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                  Express Server (Node.js)                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (Projects, Tasks, Agents, Files, etc.)  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Orchestrator (Task Queue Manager)           │  │
│  │  - Receives user requests                           │  │
│  │  - Creates execution plans                          │  │
│  │  - Manages concurrent task execution (max 3)        │  │
│  │  - Handles retries (2 attempts)                      │  │
│  │  - Emits real-time events                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Agent Manager & Dispatcher                │  │
│  │  - Owns 12+ specialized agents                      │  │
│  │  - Routes tasks to appropriate agents               │  │
│  │  - Manages agent lifecycle                          │  │
│  │  - Collects agent responses                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Model Provider Factory                        │  │
│  │  - OpenAI Client                                    │  │
│  │  - Anthropic Client                                │  │
│  │  - Google AI Client                                │  │
│  │  - Custom Provider Support                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        WebSocket Broadcast System                    │  │
│  │  - Agent status updates                            │  │
│  │  - Task completion events                          │  │
│  │  - Activity notifications                          │  │
│  │  - Real-time synchronization                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   SQLite Database                          │
│                                                             │
│  Projects • Tasks • Agents • Files • Deployments          │
│  Users • Sessions • Models • Activity Logs • Timeline      │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. **Orchestrator** (Backend Service)
Manages the entire execution lifecycle for a project.

**Responsibilities:**
- Accepts user project requests (natural language descriptions)
- Creates execution plans with subtasks and dependencies
- Maintains task queue with concurrent execution limits (default: 3 tasks max)
- Implements retry logic (2 attempts per failed task)
- Manages timeouts (5 min default per task)
- Emits events: `task:queued`, `task:started`, `task:completed`, `task:failed`
- Tracks project state and progress

**Event Flow:**
```
User Request
    ↓
Create Execution Plan (1 Planner task)
    ↓
Queue Subtasks (API Design, Backend, Database, Frontend, Tests, etc.)
    ↓
Dispatch to Agents (max 3 concurrent)
    ↓
Collect Results
    ↓
Emit Events to Dashboard
    ↓
Mark Tasks Complete/Failed
```

### 2. **Agent Manager** (Backend Service)
Manages the lifecycle of 12 specialized agents.

**12 Specialized Agents:**
1. **Owner** - Project approval and governance
2. **Planner** - Decomposes requests into subtasks
3. **API Designer** - REST/GraphQL API design
4. **Backend Developer** - Server-side implementation
5. **Database Engineer** - Schema design and queries
6. **Frontend Developer** - UI/UX implementation
7. **QA Engineer** - Test generation and validation
8. **DevOps Engineer** - Infrastructure and deployment
9. **Code Reviewer** - Code quality and standards review
10. **Debugger** - Issue diagnosis and fixes
11. **Documentation** - README, API docs, guides
12. **Orchestrator** - Task coordination and dispatch

**Agent Configuration (Per-Agent Settings):**
- API Key (for model access)
- Base URL (model provider endpoint)
- Model Selection (GPT-4, Claude 3.5, Gemini 2.0, etc.)
- Temperature (0-2, controls creativity)
- Max Tokens (output length limit)
- Enable/Disable toggle
- Custom instructions/system prompts

### 3. **Model Provider Factory** (Backend Service)
Abstracts away differences between LLM providers.

**Supported Providers:**
- **OpenAI** - GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Google AI** - Gemini 2.0 Flash, Gemini 1.5 Pro
- **Custom Providers** - Extensible for any LLM API

**Factory Pattern:**
```typescript
const client = providerFactory.createClient(agentConfig);
// Returns: OpenAIClient | AnthropicClient | GoogleAIClient | CustomClient

// Unified interface
const response = await client.chat({
  model: "gpt-4",
  messages: [...],
  temperature: 0.7
});
```

### 4. **Database Layer** (SQLite)

**Core Tables:**

| Table | Purpose |
|-------|---------|
| `projects` | Project metadata, status, owner |
| `tasks` | Individual work items (subtasks) |
| `agents` | Agent registry and metadata |
| `agent_configs` | Per-agent settings (model, temp, max_tokens) |
| `model_providers` | API credentials for OpenAI, Anthropic, etc. |
| `model_entities` | List of available models per provider |
| `files` | Project files (code, assets) |
| `versions` | Project snapshots and history |
| `deployments` | Deployment records and logs |
| `users` | User accounts and profiles |
| `sessions` | Active user sessions (JWT) |
| `activity_log` | Chronological record of all actions |
| `memory` | Agent state and context between tasks |
| `chat_messages` | Chat history and agent outputs |
| `notifications` | User alerts and messages |
| `audit_logs` | Security and compliance logging |

### 5. **WebSocket Broadcast System** (Real-time Sync)

Pushes real-time updates to connected clients.

**Events Broadcast:**
- `agent:status` - Agent started/stopped/failed
- `task:created` - New subtask added
- `task:updated` - Task progress changed
- `task:completed` - Task finished successfully
- `task:failed` - Task execution failed
- `activity:logged` - Action recorded
- `notification:sent` - User alert
- `file:modified` - File changed
- `deployment:updated` - Deployment status changed

**Architecture:**
```
Express Server
    ↓
WebSocket Handler (upgrades HTTP to WS)
    ↓
Connection Manager (tracks connected clients)
    ↓
Broadcast Manager (routes events to subscribers)
    ↓
Connected Clients (React Dashboard)
```

## Frontend Architecture (React)

### 8 Main Screens

1. **Agent IDE Screen** - Natural language project submission with real-time execution visualization
2. **Workspace Screen** - Project overview and quick actions
3. **Project Screen** - Detailed project management with file browser
4. **Kanban Screen** - Task board with drag-and-drop (Backlog, In Progress, Done, Failed)
5. **Files Screen** - Project file manager with syntax highlighting
6. **Timeline Screen** - Chronological activity log
7. **Agents Config Screen** - Per-agent settings (model, temperature, max tokens)
8. **Settings Screen** - User preferences and account management

### State Management

- **Redux Toolkit** - Global state for projects, tasks, agents
- **React Context** - Theme, authentication state
- **Local State** - Component-specific UI state
- **WebSocket Client** - Real-time updates subscribed automatically

### Libraries

- **React 19** - UI framework
- **Vite** - Fast bundler with HMR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Smooth animations
- **Monaco Editor** - Code editor for agent prompts
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Zod** - Runtime validation

## API Routes

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login with credentials
POST   /api/auth/oauth/callback - OAuth2 callback (GitHub, Google)
POST   /api/auth/refresh        - Refresh JWT token
POST   /api/auth/logout         - Logout
```

### Projects
```
GET    /api/projects            - List all projects
POST   /api/projects            - Create new project
GET    /api/projects/:id        - Get project details
PUT    /api/projects/:id        - Update project
DELETE /api/projects/:id        - Delete project
POST   /api/projects/:id/execute - Submit project for execution
GET    /api/projects/:id/timeline - Get activity timeline
```

### Tasks
```
GET    /api/tasks               - List all tasks
POST   /api/tasks               - Create task
GET    /api/tasks/:id           - Get task details
PUT    /api/tasks/:id           - Update task
DELETE /api/tasks/:id           - Delete task
POST   /api/tasks/:id/retry     - Retry failed task
```

### Agents
```
GET    /api/agents              - List all agents
GET    /api/agents/:id          - Get agent config
PUT    /api/agents/:id          - Update agent config
GET    /api/agents/:id/status   - Get agent status
```

### Files
```
GET    /api/files               - List project files
POST   /api/files               - Upload file
GET    /api/files/:id           - Get file content
PUT    /api/files/:id           - Update file
DELETE /api/files/:id           - Delete file
```

### Model Providers
```
GET    /api/models/providers    - List configured providers
POST   /api/models/providers    - Add provider
GET    /api/models              - List available models
```

### Deployments
```
GET    /api/deployments         - List deployments
POST   /api/deployments         - Deploy project
GET    /api/deployments/:id     - Get deployment details
POST   /api/deployments/:id/rollback - Rollback deployment
```

## Data Flow Example: "Build a Todo App"

```
1. USER SUBMITS REQUEST
   User: "Create a full-stack Todo app with React frontend, Node backend, SQLite database"
   ↓

2. ORCHESTRATOR RECEIVES REQUEST
   - Creates Execution Plan with subtasks
   ↓

3. PLANNER AGENT ANALYZES
   - Decomposes into: API design, DB schema, Backend API, Frontend UI, Tests, Deployment
   ↓

4. TASKS DISPATCHED (Max 3 concurrent)
   Task 1: API Designer → "Design REST API for todos"
   Task 2: DB Engineer → "Create SQLite schema"
   Task 3: Backend Dev → "Implement Node.js server"
   
   (When one task completes, next queued task starts)
   
   Task 4: Frontend Dev → "Build React components"
   Task 5: QA Engineer → "Write test cases"
   Task 6: DevOps → "Setup deployment"
   ↓

5. REAL-TIME UPDATES
   Dashboard shows:
   - Agent executing Task 1
   - Task progress bar
   - Agent output/logs
   - Kanban board updates
   - Timeline updates
   ↓

6. AGENT COMPLETES TASK
   - Saves output to database
   - Emits task:completed event via WebSocket
   - Dashboard updates in real-time
   - Orchestrator dequeues next task
   ↓

7. PROJECT COMPLETE
   - All tasks finished
   - Code ready for deployment
   - Timeline shows complete flow
   - Deployment agent pushes to production
```

## Security Architecture

### Authentication
- **JWT Tokens** - Stateless authentication with configurable expiry
- **Refresh Tokens** - Automatic token rotation
- **bcrypt Hashing** - Password encryption (10+ salt rounds)
- **OAuth2** - GitHub and Google sign-in support

### Authorization
- **Role-Based Access** - User/Admin roles
- **API Key Management** - Personal API keys with scopes
- **Scope Limitation** - Each API key has limited permissions

### Data Protection
- **CORS** - Configurable origin restrictions
- **Input Validation** - Zod schema validation on all inputs
- **Rate Limiting** - Per-endpoint rate limiting (not yet implemented)
- **Audit Logging** - All actions logged with user/timestamp

## Scalability Considerations

### Current Limits
- Max concurrent tasks: 3 (configurable)
- Max connections: 100 (configurable)
- Task timeout: 5 minutes (configurable)
- Agent timeout: 5 minutes (configurable)
- DB: Single SQLite instance (suitable for small-medium projects)

### Scaling Path
1. **Phase 1** (Current) - Single server, SQLite
2. **Phase 2** - PostgreSQL, Redis caching
3. **Phase 3** - Microservices, separate orchestrator, agent workers
4. **Phase 4** - Distributed task queue (Bull, AWS SQS)
5. **Phase 5** - Horizontal scaling with load balancer

## Extension Points

### Add a New Model Provider
```typescript
// 1. Implement ModelClient interface
class MyProviderClient implements ModelClient {
  async chat(params: ChatParams): Promise<string> { ... }
  async stream(params: ChatParams): AsyncGenerator { ... }
}

// 2. Register in provider factory
providerFactory.register('myprovider', MyProviderClient);

// 3. Add model provider config in database
// Now agents can use this provider
```

### Add a New Agent
```typescript
// 1. Add agent type and capabilities
const newAgent = {
  id: 'agent-xyz',
  name: 'My Custom Agent',
  description: '...',
  capabilities: ['capability1', 'capability2']
};

// 2. Register in AgentManager
agentManager.register(newAgent);

// 3. Planner agent automatically includes in task decomposition
```

## Performance Optimizations

- **Concurrent Task Execution** - Multiple agents work in parallel (default: 3)
- **WebSocket Broadcasting** - Single broadcast to all connected clients
- **Database Indexing** - Indexed queries on projects, tasks, users
- **Lazy Loading** - Frontend loads data on-demand
- **Code Splitting** - Vite auto-splits bundles by route
- **Caching** - Agent responses cached for repeated requests (Redis in future)

## Monitoring & Debugging

### Activity Timeline
- Chronological log of all actions
- Agent start/stop events
- Task creation/completion
- File modifications
- Deployments
- User actions

### Agent Output Logs
- Captured stdout/stderr from agents
- Visible in Dashboard
- Stored in database
- Searchable and filterable

### WebSocket Events
- Every significant event emitted in real-time
- Can be monitored via browser DevTools
- Useful for debugging race conditions

---

**See [DEVELOPMENT.md](DEVELOPMENT.md) for setup and contribution guidelines.**
