# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/SahilRajput2609/AI.git
cd AI-Company

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your config
# - Add API keys for OpenAI, Anthropic, Google AI
# - Set JWT_SECRET and SESSION_SECRET
# - Configure OAuth credentials if needed
```

### Start Development

```bash
# Start both frontend and backend with hot-reload
npm run dev

# Open browser: http://localhost:5173
```

## Project Structure Explained

```
AI-Company/
├── apps/
│   ├── dashboard/              # React frontend
│   │   ├── src/
│   │   │   ├── screens/       # Page components (8 screens)
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── lib/           # API client, WebSocket, utilities
│   │   │   ├── App.tsx        # Main app component with routing
│   │   │   └── index.css      # Global styles (Tailwind)
│   │   ├── vite.config.ts     # Vite bundler config
│   │   └── package.json
│   │
│   └── server/                 # Express backend
│       ├── src/
│       │   ├── index.ts       # Express server setup
│       │   ├── routes/        # API endpoints
│       │   ├── services/      # Business logic (Orchestrator, Agent Manager)
│       │   ├── websocket.ts   # WebSocket setup and broadcast
│       │   ├── middleware/    # Authentication, error handling, validation
│       │   └── ai/            # Model provider factory and clients
│       ├── data/              # SQLite database files
│       └── package.json
│
├── packages/                   # Shared code across apps
│   ├── shared/                # Shared types, constants, utilities
│   ├── ui/                    # Reusable UI components (optional)
│   ├── api/                   # API client utilities
│   ├── backend/               # Backend utilities, error handling
│   ├── database/              # Database layer, repositories, migrations
│   └── orchestrator/          # Orchestrator service
│
├── README.md                  # Project overview
├── ARCHITECTURE.md            # System design and components
├── DEVELOPMENT.md             # This file
├── .env.example               # Environment template
├── package.json               # Root monorepo config
└── tsconfig.json              # TypeScript configuration

```

## Frontend Development

### Adding a New Screen

1. **Create screen component** in `apps/dashboard/src/screens/MyScreen.tsx`:
```typescript
import React from 'react'

export function MyScreen() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Screen</h1>
    </div>
  )
}
```

2. **Add to App.tsx routing**:
```typescript
import { MyScreen } from './screens/MyScreen'

// Add to screen selector
const screenComponent = (() => {
  switch (screen) {
    case 'myscreen':
      return <MyScreen />
    // ... other screens
  }
})()
```

3. **Add to navigation** in `Sidebar.tsx`:
```typescript
<button onClick={() => setScreen('myscreen')}>My Screen</button>
```

### API Integration

Use the `api` client from `lib/api.ts`:

```typescript
import { api } from './lib/api'

// Fetch projects
const projects = await api.getProjects()

// Create project
const newProject = await api.createProject({
  name: 'My Project',
  description: '...'
})

// Update project
await api.updateProject(projectId, { status: 'completed' })
```

### Real-time Updates

Subscribe to WebSocket events:

```typescript
import { realtime } from './lib/realtime'

useEffect(() => {
  const unsubscribe = realtime.subscribe('task:completed', (task) => {
    console.log('Task completed:', task)
    // Update UI
  })
  
  return unsubscribe
}, [])
```

### Styling

Uses Tailwind CSS. Add classes directly:

```typescript
<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
  <h2 className="text-lg font-semibold text-blue-900">Title</h2>
  <p className="text-sm text-blue-700 mt-2">Description</p>
</div>
```

Common patterns:
- `p-4` - Padding
- `mt-2` - Margin top
- `bg-blue-50` - Background color
- `text-lg` - Font size
- `font-semibold` - Font weight
- `rounded-lg` - Border radius
- `border` - Border
- `shadow-md` - Drop shadow

### State Management

Use React hooks:

```typescript
import { useState, useEffect } from 'react'

export function MyComponent() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    api.getData().then(setData)
  }, [])
  
  return <div>{data ? 'Loaded' : 'Loading...'}</div>
}
```

For global state, Redux is available but minimal. Consider using React Context for simple cases.

## Backend Development

### Adding an API Endpoint

1. **Create route handler** in `apps/server/src/routes/`:

```typescript
// routes/my-route.ts
import express from 'express'

export const myRouter = express.Router()

myRouter.get('/my-endpoint', async (req, res) => {
  try {
    const result = await someService.doSomething()
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

2. **Register in main API router** in `apps/server/src/routes/api.ts`:

```typescript
import { myRouter } from './my-route'

router.use('/my-prefix', myRouter)
```

3. **Test with curl**:

```bash
curl http://localhost:3001/api/my-prefix/my-endpoint
```

### Using Database

Access via repositories:

```typescript
import { ProjectRepository } from '@ai-company/database'

const projectRepo = new ProjectRepository()
const projects = projectRepo.getAll()
const project = projectRepo.getById(id)

projectRepo.create({ name: 'New Project' })
projectRepo.update(id, { status: 'completed' })
projectRepo.delete(id)
```

### Emitting Real-time Events

```typescript
import { broadcast } from './websocket'

// After task completes
broadcast('task:completed', {
  id: taskId,
  status: 'completed',
  output: result
})
```

### Agent Integration

Dispatch work to agents:

```typescript
import { AgentManager } from './services/agent.manager'

const agentManager = new AgentManager()

// Get agent
const backendAgent = agentManager.getAgent('backend-developer')

// Ask agent to do something
const result = await backendAgent.execute({
  task: 'Implement user authentication endpoint',
  context: projectData
})
```

## Testing

### Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

Test file locations:
- Frontend: `apps/dashboard/src/**/*.test.ts(x)`
- Backend: `apps/server/src/**/*.test.ts` or `__tests__/**`
- Packages: `packages/*/src/**/*.test.ts`

Example test:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateTotal } from './math'

describe('math utilities', () => {
  it('calculates total correctly', () => {
    const result = calculateTotal([1, 2, 3])
    expect(result).toBe(6)
  })
})
```

## Code Quality

### Type Checking

Ensure TypeScript types are valid:

```bash
npm run typecheck
```

### Linting

Check for code quality issues:

```bash
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Formatting

Check code formatting:

```bash
npm run format

# Auto-format code
npm run format:fix
```

### CI Pipeline

Run complete validation (what CI runs):

```bash
npm run ci
```

This runs: typecheck → lint → test

## Debugging

### Frontend Debugging

1. Open Chrome DevTools (F12)
2. Go to **Elements** tab to inspect UI
3. Go to **Console** tab to see logs and errors
4. Go to **Network** tab to see API calls
5. Go to **Application** tab to see localStorage/cookies

### Backend Debugging

Add console logs:

```typescript
console.log('Debug info:', variable)
console.error('Error:', error)
```

View in terminal where `npm run dev` is running.

For more detailed debugging, use Node debugger:

```bash
node --inspect-brk apps/server/src/index.ts
```

Then open `chrome://inspect` in Chrome.

### Database Debugging

View database file:
```bash
# Install sqlite3 CLI if not present
sqlite3 apps/server/data/ai-company.db

# View tables
.tables

# Query data
SELECT * FROM projects;
SELECT * FROM tasks;
```

## Git Workflow

### Making Changes

1. Edit files
2. Changes auto-reload (frontend at localhost:5173, backend restarts)
3. Test manually in browser or API
4. Run tests: `npm test`
5. Run linting: `npm run lint:fix`

### Committing

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add feature: describe what changed"

# Examples:
# git commit -m "Add Kanban board component"
# git commit -m "Fix agent timeout bug"
# git commit -m "Implement real-time WebSocket sync"
```

### Pushing to GitHub

```bash
# Push to main branch
git push origin master:main
```

Or one-liner:

```bash
git add . && git commit -m "Your message" && git push origin master:main
```

## Environment Variables

Create `.env` file in root:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./apps/server/data/ai-company.db

# API Keys - Get from provider dashboards
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Security - Generate random strings
JWT_SECRET=your_random_secret_here_min_32_chars
SESSION_SECRET=another_random_secret_here

# OAuth (optional)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Agent Configuration
MAX_CONCURRENT_AGENTS=5
AGENT_TIMEOUT_MS=300000

# Feature Flags
ENABLE_TELEMETRY=true
ENABLE_AUTO_SAVE=true
```

## Common Tasks

### Add a new npm package

```bash
# Add to root (used by all workspaces)
npm install package-name

# Add to specific workspace
npm install package-name -w apps/dashboard
npm install package-name -w apps/server
```

### Update dependencies

```bash
# Check for updates
npm outdated

# Update all packages
npm update
```

### Clear build artifacts

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Rebuild everything
npm run build
```

## Performance Tips

- **Use React.memo()** for expensive components that rarely change
- **Lazy load routes** with React.lazy() for code splitting
- **Debounce API calls** to reduce server load
- **Use WebSocket** instead of polling for real-time updates
- **Index database queries** on frequently searched columns
- **Cache agent responses** for repeated requests

## Troubleshooting

### "Port 3001 already in use"
```bash
# Use different port
PORT=3002 npm run dev
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "Database locked"
```bash
# SQLite single-writer issue; restart server
# Kill the process and restart
npm run dev
```

### "WebSocket connection failed"
- Check if server is running on correct port
- Check CORS settings in .env
- Open browser console (F12) to see error

### TypeScript errors after changes
```bash
# Rebuild workspace packages
npm run build

# Or restart dev server
npm run dev
```

## Resources

- [React Documentation](https://react.dev)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## Getting Help

- Check existing issues: https://github.com/SahilRajput2609/AI/issues
- Read ARCHITECTURE.md for system design
- Ask in discussions: https://github.com/SahilRajput2609/AI/discussions

---

Happy coding! 🚀
