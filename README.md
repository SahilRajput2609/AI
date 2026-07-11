# AI-Company

A full-stack platform for managing AI agents, projects, and collaborative workflows. Built with modern TypeScript, React, and Express.

## 🎯 Why This Project Exists

### The Problem
Modern software development is time-consuming and expensive. Teams need:
- **Project planning & decomposition** - Breaking down complex requests into manageable tasks
- **Full-stack implementation** - Writing code for backend, frontend, database layers
- **Quality assurance** - Testing, debugging, validation
- **DevOps & deployment** - Building, deploying, monitoring applications

A small team of 5-7 developers takes weeks to deliver a single project.

### The Solution
**AI-Company** orchestrates autonomous AI agents to execute the complete development lifecycle without human intervention between phases:

```
User Request → Planner Agent → Backend Dev → Frontend Dev → QA Agent → DevOps Agent → Deployment
```

### What It Does
1. **Accepts high-level project descriptions** in natural language (e.g., "Build a user authentication system")
2. **Automatically decomposes** the request into specialized subtasks (API design, database schema, UI components, tests)
3. **Dispatches tasks** to 12+ specialized agents (Owner, Planner, API Designer, Backend Dev, Database Engineer, Frontend Dev, QA, DevOps, Code Reviewer, Debugger, Documentation, Orchestrator)
4. **Executes concurrently** with configurable parallelism (default 3 tasks max)
5. **Provides real-time visibility** via Dashboard showing task progress, agent status, logs, and timeline
6. **Handles retries & recovery** with 2-attempt retry logic and timeout management
7. **Supports multi-model LLMs** - Switch between OpenAI, Anthropic, Google AI to optimize cost/capability

### Business Value
- **90% faster delivery** - From weeks to days/hours for complex projects
- **70% cost reduction** - Replace 5-7 junior developers with coordinated AI agents
- **Consistent quality** - Built-in code review, testing, and documentation agents
- **No vendor lock-in** - Multi-provider support lets you choose the best model for each task
- **Full auditability** - Complete activity timeline traces every decision and action

### Who Uses It
- **AI/ML Engineers** - Configure agents and model providers
- **Full-Stack Developers** - Submit projects via natural language; watch agents build them
- **Project Managers** - Monitor progress via Kanban board and timeline
- **DevOps Engineers** - Manage deployments and agent infrastructure
- **QA Engineers** - Use QA agent for automated testing

## 🚀 Features

- **Agent Management** - Create, configure, and monitor AI agents in real-time
- **Project Workspace** - Organize projects with task tracking and collaboration tools
- **Kanban Board** - Visual task management with drag-and-drop interface
- **Code Editor** - Monaco-powered code editor for agent prompts and configurations
- **Real-time Sync** - WebSocket-based live updates across all clients
- **File Management** - Organize and manage project files and assets
- **Timeline View** - Track project progress and agent activities
- **Agent IDE** - Comprehensive IDE for building and testing AI agents
- **Authentication** - Secure OAuth (GitHub, Google) and JWT-based authentication
- **Multi-Model Support** - Integrate OpenAI, Anthropic, Google AI, and custom providers

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **SQLite** 3.x (included via better-sqlite3)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/SahilRajput2609/AI.git
cd AI-Company
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./apps/server/data/ai-company.db

# API Keys (get from respective providers)
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here

# JWT Security
JWT_SECRET=your_secure_random_string
SESSION_SECRET=your_secure_random_string

# OAuth (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Configuration
MAX_CONCURRENT_AGENTS=5
AGENT_TIMEOUT_MS=300000
WS_HEARTBEAT_INTERVAL=30000
```

## 📦 Project Structure

```
AI-Company/
├── apps/
│   ├── dashboard/           # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── screens/    # Page components
│   │   │   ├── components/ # Reusable UI components
│   │   │   └── lib/        # API, realtime, utilities
│   │   └── vite.config.ts
│   │
│   └── server/              # Express backend
│       ├── src/
│       │   ├── index.ts     # Server entry point
│       │   ├── routes/      # API endpoints
│       │   ├── websocket.ts # WebSocket setup
│       │   └── services/    # Business logic
│       └── data/            # SQLite database
│
└── packages/                # Shared packages
    ├── shared/              # Shared types & utilities
    ├── ui/                  # UI component library
    ├── api/                 # API client
    ├── backend/             # Backend utilities
    └── database/            # Database layer
```

## 🚀 Quick Start

### Development Mode

Start both dashboard and server with hot-reload:

```bash
npm run dev
```

This runs concurrently:
- **Dashboard**: http://localhost:5173 (Vite dev server)
- **Server**: http://localhost:3001 (Express server)

### Dashboard Development Only

```bash
npm run dev -w apps/dashboard
```

Open http://localhost:5173 in your browser.

### Server Development Only

```bash
npm run dev -w apps/server
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Type Checking

Verify TypeScript compilation without generating files:

```bash
npm run typecheck
```

## 📐 Code Quality

### Linting

Check for code quality issues:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

### Code Formatting

Check code formatting:

```bash
npm run format
```

Auto-format code:

```bash
npm run format:fix
```

### CI Pipeline

Run all checks (linting, testing, type-checking):

```bash
npm run ci
```

## 🏗️ Building

### Build All Packages

```bash
npm run build
```

This compiles:
1. Server (TypeScript → JavaScript)
2. Dashboard (React + Vite bundle)

### Production Build

```bash
npm run build
npm start
```

The server serves the built dashboard at http://localhost:3001

## 📱 Available Screens

- **Workspace** - Project overview and quick actions
- **Projects** - Manage all projects and teams
- **Kanban** - Visual task board with drag-and-drop
- **Files** - File browser and manager
- **Timeline** - Activity timeline and history
- **Agent IDE** - Comprehensive agent development environment
- **Agents Config** - Configure agent settings and behavior
- **Settings** - User preferences and account management

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/oauth/callback` - OAuth callback handler

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent config
- `PUT /api/agents/:id` - Update agent
- `POST /api/agents/:id/run` - Execute agent

### WebSocket
- Real-time agent status updates
- Live project synchronization
- Chat notifications

## 🔐 Security

- **JWT Authentication** - Secure token-based auth
- **CORS Configuration** - Configurable origin restrictions
- **Password Hashing** - Bcrypt password encryption
- **Environment Secrets** - Sensitive data via `.env`
- **Input Validation** - Request validation with Zod

## 🐛 Troubleshooting

### Port Already in Use

If port 3001 is in use, change it:

```bash
PORT=3002 npm run dev
```

### Database Errors

Reset the database:

```bash
rm apps/server/data/ai-company.db*
npm run dev
```

### Module Not Found

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Failures

Clear build artifacts and rebuild:

```bash
npm run build -- --force
```

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Express 5, Node.js, WebSocket |
| **Database** | SQLite, better-sqlite3 |
| **AI Models** | OpenAI, Anthropic, Google AI |
| **State** | Redux Toolkit, React Context |
| **Styling** | Tailwind CSS, Framer Motion |
| **Forms** | React Hook Form, Zod |
| **Code Editor** | Monaco Editor |
| **Testing** | Vitest, React Testing Library |

## 🚦 Scripts Reference

| Command | Description |
|---------|------------|
| `npm run dev` | Start dev servers (dashboard + server) |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Check formatting |
| `npm run format:fix` | Auto-format code |
| `npm run ci` | Run full CI pipeline |

## 📝 Git Workflow

### Push Local Changes to GitHub

```bash
# Stage all changes
git add .

# Create commit
git commit -m "Your descriptive message"

# Push to main branch
git push origin master:main
```

Or use the convenient one-liner:

```bash
git add . && git commit -m "Your message" && git push origin master:main
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test thoroughly
3. Run `npm run ci` to ensure code quality
4. Commit with clear messages
5. Push and create a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For issues, questions, or contributions, please visit [GitHub Issues](https://github.com/SahilRajput2609/AI/issues)

---

**Last Updated:** July 2026

Made with ❤️ by the AI-Company Team
