#!/bin/bash

# AI-Company Demo: Build a Todo App with Autonomous Agents
# This script simulates submitting a complete project to be built by AI agents

PROJECT_ID="project_1783767588014_vw7ypx5"
BASE_URL="http://localhost:3001/api"

echo "======================================"
echo "🚀 AI-Company Demo: Todo App Project"
echo "======================================"
echo ""
echo "Project: Todo App MVP"
echo "Project ID: $PROJECT_ID"
echo ""

# Task 1: API Design
echo "📋 Submitting Task 1: API Design"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "title": "Design REST API",
    "description": "Design REST API endpoints for Todo CRUD operations: GET /todos, POST /todos, PUT /todos/:id, DELETE /todos/:id. Include request/response schemas and error handling.",
    "assignedAgent": "api-designer",
    "priority": "high",
    "status": "in_progress"
  }' | grep -o '"id":"[^"]*"'
echo ""

# Task 2: Database Schema
echo "📋 Submitting Task 2: Database Schema Design"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "title": "Create Database Schema",
    "description": "Design SQLite schema for todos table with fields: id (primary key), userId (foreign key), title (string), description (text), completed (boolean), dueDate (date), createdAt (timestamp), updatedAt (timestamp)",
    "assignedAgent": "database-engineer",
    "priority": "high",
    "status": "in_progress"
  }' | grep -o '"id":"[^"]*"'
echo ""

# Task 3: Backend Implementation
echo "📋 Submitting Task 3: Backend Implementation"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "title": "Implement Backend API Server",
    "description": "Build Express.js server with: JWT authentication middleware, CRUD endpoints for todos, database integration, error handling, request validation. Use bcrypt for password hashing.",
    "assignedAgent": "backend-developer",
    "priority": "high",
    "status": "in_progress"
  }' | grep -o '"id":"[^"]*"'
echo ""

# Task 4: Frontend Components
echo "📋 Submitting Task 4: Frontend Components"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "title": "Build React Frontend",
    "description": "Create React components: TodoList (main view), TodoForm (add/edit), TodoItem (individual todo), LoginForm (authentication). Use React Hooks, integrate with backend API.",
    "assignedAgent": "frontend-developer",
    "priority": "high",
    "status": "in_progress"
  }' | grep -o '"id":"[^"]*"'
echo ""

# Task 5: Unit Tests
echo "📋 Submitting Task 5: Unit Tests"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "title": "Write Unit Tests",
    "description": "Create comprehensive unit tests using Jest and React Testing Library. Test all API endpoints, authentication flow, and React components. Achieve 80%+ code coverage.",
    "assignedAgent": "qa-engineer",
    "priority": "medium",
    "status": "queued"
  }' | grep -o '"id":"[^"]*"'
echo ""

# Task 6: Documentation
echo "📋 Submitting Task 6: Documentation"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "title": "Write Documentation",
    "description": "Create README.md with setup instructions, API documentation, authentication guide, and development workflow. Add code comments and JSDoc for all functions.",
    "assignedAgent": "documentation",
    "priority": "medium",
    "status": "queued"
  }' | grep -o '"id":"[^"]*"'
echo ""

# Get all tasks
echo "======================================"
echo "📊 Project Tasks Overview"
echo "======================================"
echo ""
curl -s -X GET "$BASE_URL/tasks" \
  -H "Content-Type: application/json" | grep -o '"id":"[^"]*"\|"title":"[^"]*"\|"status":"[^"]*"' | head -30
echo ""

# Get project tasks
echo "======================================"
echo "📋 Tasks for Todo App Project"
echo "======================================"
echo ""
curl -s -X GET "$BASE_URL/projects/$PROJECT_ID/tasks" \
  -H "Content-Type: application/json"
echo ""

echo "======================================"
echo "✅ Demo Project Created!"
echo "======================================"
echo ""
echo "6 Tasks Submitted to Agents:"
echo "  ✓ API Designer - REST API Design"
echo "  ✓ Database Engineer - Schema Design"
echo "  ✓ Backend Developer - Server Implementation"
echo "  ✓ Frontend Developer - React Components"
echo "  ✓ QA Engineer - Unit Tests"
echo "  ✓ Documentation Agent - README & Docs"
echo ""
echo "View in Dashboard:"
echo "  📊 Kanban: http://localhost:5173"
echo "  📝 Timeline: http://localhost:5173?screen=timeline"
echo "  📁 Files: http://localhost:5173?screen=files"
echo ""
echo "The agents are now working concurrently!"
