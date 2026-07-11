# Features & Capabilities

## Overview

AI-Company provides a comprehensive platform for orchestrating autonomous AI agents. This document explains each feature, how to use it, and what problems it solves.

## 1. Agent IDE

### What It Does
A terminal-like interface where you submit natural language project descriptions and watch AI agents execute them in real-time.

### How to Use
1. Go to **Agent IDE** screen (http://localhost:5173)
2. Type your project description:
   ```
   "Build a user authentication system with JWT tokens, bcrypt password hashing, 
   and OAuth support for GitHub and Google. Include unit tests and documentation."
   ```
3. Click **Submit** or press Enter
4. Watch the execution plan unfold:
   - Planner decomposes into subtasks
   - Agents execute concurrently
   - Real-time logs show progress
   - Files are generated and added to project

### Example Descriptions
- "Create a REST API for a Todo app with CRUD operations"
- "Build a React dashboard with user profile, settings, and notifications"
- "Implement a WebSocket real-time chat system"
- "Add database migrations for user authentication"

### Under the Hood
```
User Input → Orchestrator.execute(description)
  ↓
Planner Agent → Creates execution plan with subtasks
  ↓
Max 3 concurrent agents execute:
  - API Designer → Designs endpoints
  - Backend Dev → Implements server
  - Database Engineer → Creates schema
  - Frontend Dev → Builds UI
  - QA Engineer → Writes tests
  ↓
Real-time WebSocket broadcasts status
  ↓
Files saved to project
```

## 2. Kanban Board

### What It Does
Visual task management system with drag-and-drop interface. View all tasks across the entire project organized by status.

### Columns
- **Backlog** - New tasks not yet started
- **In Progress** - Tasks currently being worked on
- **In Review** - Tasks awaiting approval
- **Done** - Completed tasks
- **Failed** - Tasks that failed and need retrying

### How to Use
1. Go to **Kanban** screen
2. View all tasks for current project
3. Drag cards between columns to update status
4. Click card to see details:
   - Task description
   - Assigned agent
   - Progress percentage
   - Output logs
   - Retry button (if failed)

### Features
- **Filter by agent** - Show only tasks from specific agent
- **Filter by status** - Focus on In Progress items
- **Sort by priority** - Urgent tasks first
- **Search** - Find task by name or description
- **Bulk operations** - Select multiple and retry/archive

### Real-time Updates
- When agents update tasks, Kanban refreshes instantly
- Other users see updates in real-time
- Collaborative task management

## 3. Project Workspace

### What It Does
Dashboard view of all projects with status, team members, progress, and quick actions.

### How to Use
1. Go to **Workspace** screen
2. View all your projects in a grid
3. Each project card shows:
   - Project name and description
   - Status (Planning, In Progress, Testing, Deployed)
   - Team members
   - Progress bar (0-100%)
   - Last updated timestamp

4. Click **New Project** to:
   - Enter project name and description
   - Select team members
   - Configure deployment settings
   - Save

5. Click project card to view:
   - Detailed project info
   - File browser
   - Agent pipeline status
   - Deployment history

### Workspace Features
- **Project filtering** - By status, team, date
- **Sort options** - By name, date updated, progress
- **Quick actions** - Archive, share, duplicate project
- **Recent activity** - See what changed recently

## 4. Files Manager

### What It Does
Browser and editor for project files. View, edit, upload, and organize project files.

### How to Use
1. Go to **Files** screen
2. View project directory structure
3. Click file to view contents with syntax highlighting
4. Click **Edit** to modify file
5. Changes are auto-saved
6. Upload new files with drag-and-drop

### File Operations
- **View** - Syntax-highlighted code preview
- **Edit** - Monaco editor with autocomplete
- **Delete** - Remove unwanted files
- **Rename** - Change file name
- **Download** - Export file to computer
- **Search** - Find files by name or content

### File Metadata
For each file, see:
- Type (JS, TS, CSS, JSON, etc.)
- Language/Framework
- File size
- Lines of code (for source files)
- Last modified by (user/agent)
- Creation date

### Integration with Agents
- Agents read/write project files
- Changes tracked in timeline
- File history available for rollback

## 5. Timeline View

### What It Does
Chronological activity log showing everything that happened in the project.

### How to Use
1. Go to **Timeline** screen
2. Scroll through events in reverse chronological order (newest first)
3. Each event shows:
   - Timestamp
   - Event type (agent started, task created, file modified, etc.)
   - Who did it (user or agent)
   - Description
   - Details (click to expand)

### Event Types
- **Agent Events**
  - `agent:started` - Agent began working
  - `agent:stopped` - Agent finished
  - `agent:failed` - Agent encountered error

- **Task Events**
  - `task:created` - New task created
  - `task:assigned` - Task assigned to agent
  - `task:started` - Agent began task
  - `task:completed` - Task finished
  - `task:failed` - Task failed
  - `task:retried` - Task attempted again

- **File Events**
  - `file:created` - New file added
  - `file:modified` - File changed
  - `file:deleted` - File removed

- **Deployment Events**
  - `deployment:started` - Deployment initiated
  - `deployment:completed` - Live
  - `deployment:failed` - Failed to deploy
  - `deployment:rollback` - Reverted to previous

- **User Events**
  - `user:created_project` - User created project
  - `user:submitted_request` - User submitted to agents

### Timeline Features
- **Filter by type** - Show only specific event types
- **Filter by agent** - Show only events from agent X
- **Search** - Find events by description
- **Export** - Download timeline as JSON/CSV

### Audit Trail
Complete record for compliance:
- Who did what
- When they did it
- What changed
- Previous values (for modifications)

## 6. Agent IDE (Advanced)

### What It Does
Full development environment for agents. Configure agent behavior, test prompts, and monitor agent execution.

### Screens

#### Agent Configuration
- **Model Selection** - Choose LLM (GPT-4, Claude 3.5, Gemini 2.0, etc.)
- **Temperature** - 0 (deterministic) to 2 (creative)
- **Max Tokens** - Output length limit
- **Custom Instructions** - System prompt for agent
- **API Key** - Credentials for model provider
- **Enable/Disable** - Turn agent on/off
- **Capabilities** - List of tasks agent can perform

#### Test Agent
- **Prompt Input** - Write test prompt
- **Submit** - Send to agent
- **Response Stream** - See output in real-time
- **Full Logs** - Complete transcript with timing

#### Agent Status
- Real-time status (Idle, Working, Error)
- Current task (if any)
- Total tasks completed
- Success rate percentage
- Error logs with timestamps

### Use Cases
- **Tune Performance** - Adjust temperature/tokens until agent works well
- **Debug Issues** - Test prompts to see why agent fails
- **Monitor Health** - Check if agent is responsive
- **Integrate Custom Agents** - Add new agent types

## 7. Agents Configuration

### What It Does
Centralized management panel for all 12 agents. Configure each agent's behavior, model provider, and capabilities.

### Agent List
1. **Owner** - Project approval and governance
2. **Planner** - Decomposes requests into subtasks
3. **API Designer** - REST/GraphQL API design
4. **Backend Developer** - Server implementation
5. **Database Engineer** - Schema design
6. **Frontend Developer** - UI/UX implementation
7. **QA Engineer** - Test generation
8. **DevOps Engineer** - Infrastructure
9. **Code Reviewer** - Code quality review
10. **Debugger** - Issue diagnosis
11. **Documentation** - README/API docs
12. **Orchestrator** - Task coordination

### Configure Each Agent
For each agent, set:
- **Model Provider** - Which LLM to use
- **Model** - Specific model version (GPT-4, Claude 3.5, Gemini 2.0, etc.)
- **Temperature** - 0-2 (lower = more consistent, higher = more creative)
- **Max Tokens** - Maximum output length
- **API Key** - Credentials (uses provider config if empty)
- **Custom Instructions** - System prompt
- **Timeout** - How long to wait for response (ms)
- **Retry Count** - Attempts before failure
- **Enabled** - Enable/disable agent

### Save Preferences
- Configurations automatically saved
- Changes take effect immediately
- Per-project or global settings
- Export/import configurations

## 8. Model Providers

### What It Does
Manage API credentials for multiple LLM providers. Choose which model each agent uses.

### Supported Providers

#### OpenAI
- Models: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, etc.
- Pricing: Variable based on tokens
- Speed: Fast
- Use case: General purpose, code generation

#### Anthropic
- Models: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku, etc.
- Pricing: Competitive, longer context window
- Speed: Medium
- Use case: Long context, analysis, reasoning

#### Google AI
- Models: Gemini 2.0 Flash, Gemini 1.5 Pro, etc.
- Pricing: Affordable
- Speed: Very fast
- Use case: Quick responses, multimodal

#### Custom Providers
- Any provider supporting OpenAI-compatible API
- Examples: Ollama (local), Together AI, Replicate, etc.

### How to Configure

1. Go to **Settings** → **Model Providers**
2. Click **Add Provider**
3. Select provider type
4. Enter credentials:
   - API Key
   - Base URL (optional, uses default if empty)
5. Test connection
6. Save

### Provider Selection Strategy
- **Cost-sensitive**: Use Gemini Flash (fastest, cheapest)
- **Quality-focused**: Use Claude 3.5 Sonnet or GPT-4
- **Hybrid**: Use different providers for different agents
  - Planner → Claude (excellent decomposition)
  - Backend Dev → GPT-4 (great code)
  - Frontend Dev → Claude (good CSS/UX)
  - QA → Gemini (quick test generation)

## 9. Settings & Account Management

### User Settings
- **Theme** - Light/dark mode
- **Notifications** - Email/browser alerts
- **Keyboard Shortcuts** - Customize hotkeys
- **Default Model** - Preferred LLM
- **Language** - UI language (EN, ES, FR, etc.)

### Account Management
- **Profile** - Name, email, avatar
- **Password** - Change password
- **Two-Factor Auth** - Enable 2FA
- **Sessions** - View active login sessions
- **API Keys** - Create/revoke personal API keys

### Organization Settings (Admin Only)
- **Team Members** - Add/remove users
- **Roles** - Admin, Developer, Viewer
- **Billing** - Payment method, invoices
- **API Usage** - Monthly API calls, costs
- **Audit Log** - Who did what and when

## 10. Real-time Synchronization

### What It Does
Multiple users can work on the same project simultaneously. All changes sync in real-time via WebSocket.

### Features
- **Live Task Updates** - See tasks change instantly
- **Agent Status** - Know what agents are doing
- **Collaborative Editing** - Multiple users edit files
- **Notifications** - Get alerts on important events
- **Conflict Resolution** - Last-write-wins for conflicting edits

### Use Cases
- **Team Development** - Multiple devs on same project
- **Code Review** - Reviewer watches code being generated
- **Monitoring** - Manager watches agent progress
- **Multi-office** - Teams across timezones stay synced

## 11. Deployment Management

### What It Does
Deploy projects to production automatically. Track deployment status and history.

### Deployment Platforms
- **Vercel** - Static sites, Next.js apps
- **AWS** - EC2, Lambda, ECS
- **Heroku** - Simple Node.js deployment
- **Custom** - Any platform supporting webhooks

### Deployment Process
1. Agent generates code
2. Tests pass
3. DevOps agent deploys
4. Health checks run
5. Traffic routed to new version
6. Previous version saved for rollback

### Deployment Features
- **Automatic Deployments** - Deploy on successful build
- **Manual Deployments** - Deploy specific version
- **Staging** - Test before production
- **Blue-Green** - Zero-downtime deployments
- **Rollback** - Revert to previous version instantly
- **Logs** - Build and deployment logs
- **Health Checks** - Monitor deployed app

### Deployment History
- View all past deployments
- See what changed (diff)
- Compare versions
- Revert to any previous version

## 12. Authentication & Security

### How to Log In
1. Visit http://localhost:5173
2. Click **Login**
3. Options:
   - **Email/Password** - Create account or login
   - **GitHub OAuth** - Click "Sign in with GitHub"
   - **Google OAuth** - Click "Sign in with Google"

### Security Features
- **JWT Tokens** - Stateless authentication
- **Password Hashing** - Bcrypt with salt
- **HTTPS** - Encrypted communication (production)
- **CORS** - Cross-origin request restrictions
- **Input Validation** - Prevent injection attacks
- **Rate Limiting** - Prevent brute force
- **Audit Logging** - Track all user actions

### API Key Management
- Create personal API keys for programmatic access
- Each key has scopes (read/write projects, agents, etc.)
- Revoke compromised keys
- Keys never logged or displayed again after creation

---

## Feature Comparison Chart

| Feature | Free | Pro | Enterprise |
|---------|------|-----|-----------|
| Agent IDE | ✓ | ✓ | ✓ |
| Kanban Board | ✓ | ✓ | ✓ |
| Projects | 5 | 50 | Unlimited |
| Team Members | 1 | 10 | Unlimited |
| Model Providers | All | All | All |
| Concurrent Tasks | 1 | 3 | 10 |
| API Access | ✓ | ✓ | ✓ |
| Webhooks | - | ✓ | ✓ |
| Custom Agents | - | - | ✓ |
| SLA Support | - | - | ✓ |

---

## Tips & Tricks

### Optimize Agent Performance
1. Use specific, detailed prompts
2. Set temperature to 0 for consistency
3. Increase max_tokens if output is truncated
4. Use Claude for analysis, GPT-4 for coding

### Troubleshoot Agent Failures
1. Check agent is enabled in config
2. Verify API key is valid
3. Test with custom prompt in Agent IDE
4. Check timeout isn't too short
5. Review error logs in timeline

### Maximize Concurrency
1. Design independent subtasks
2. Increase MAX_CONCURRENT_AGENTS (default: 3)
3. Use agents with different models to parallelize
4. Monitor CPU/memory usage

### Monitor Costs
1. Check API usage in settings
2. Switch to cheaper models if quality acceptable
3. Use Gemini Flash for quick tasks
4. Batch requests to reduce API calls

---

See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details on how features work.
