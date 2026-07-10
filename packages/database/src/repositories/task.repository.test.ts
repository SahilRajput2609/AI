import { describe, it, expect, beforeAll } from 'vitest'
import Database from 'better-sqlite3'
import { TaskRepository } from './task.repository.js'

function createTestDb() {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      assigned_agent TEXT,
      progress INTEGER DEFAULT 0,
      tags TEXT,
      attachments INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)
  return db
}

describe('TaskRepository', () => {
  let repo: TaskRepository
  let projectId: string

  beforeAll(() => {
    const db = createTestDb()
    repo = new TaskRepository(db)

    const stmt = db.prepare(
      'INSERT INTO projects (id, name, path, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    stmt.run('project-1', 'Test Project', '/project-1', 'active', Date.now(), Date.now())
    projectId = 'project-1'
  })

  it('creates a task', () => {
    const task = repo.create({
      project_id: projectId,
      title: 'Test Task',
      description: 'A test task',
      status: 'pending',
      priority: 'high',
      tags: ['bug', 'frontend'],
    })

    expect(task.id).toBeTruthy()
    expect(task.title).toBe('Test Task')
    expect(task.tags).toEqual(['bug', 'frontend'])
    expect(task.progress).toBe(0)
    expect(task.created_at).toBeGreaterThan(0)
  })

  it('finds task by id', () => {
    const created = repo.create({
      project_id: projectId,
      title: 'Find Me',
      status: 'pending',
      priority: 'medium',
    })

    const found = repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.title).toBe('Find Me')
  })

  it('returns null when task not found', () => {
    expect(repo.findById('nonexistent')).toBeNull()
  })

  it('finds tasks by project', () => {
    const tasks = repo.findByProject(projectId)
    expect(tasks.length).toBeGreaterThanOrEqual(2)
  })

  it('finds tasks by status', () => {
    repo.create({
      project_id: projectId,
      title: 'Done Task',
      status: 'completed',
      priority: 'low',
    })

    const doneTasks = repo.findByStatus(projectId, 'completed')
    expect(doneTasks.length).toBe(1)
    expect(doneTasks[0].title).toBe('Done Task')
  })

  it('finds tasks by agent', () => {
    repo.create({
      project_id: projectId,
      title: 'Agent Task',
      status: 'in_progress',
      priority: 'high',
      assigned_agent: 'agent-1',
    })

    const tasks = repo.findByAgent('agent-1')
    expect(tasks.length).toBe(1)
  })

  it('updates a task', () => {
    const task = repo.create({
      project_id: projectId,
      title: 'Update Me',
      status: 'pending',
      priority: 'medium',
    })

    const updated = repo.update(task.id, { title: 'Updated Task', status: 'in_progress', progress: 50 })
    expect(updated).not.toBeNull()
    expect(updated!.title).toBe('Updated Task')
    expect(updated!.status).toBe('in_progress')
    expect(updated!.progress).toBe(50)
  })

  it('auto-sets completed_at when status becomes done', () => {
    const task = repo.create({
      project_id: projectId,
      title: 'Complete Me',
      status: 'pending',
      priority: 'low',
    })

    const updated = repo.update(task.id, { status: 'completed' })
    expect(updated!.completed_at).toBeGreaterThan(0)
  })

  it('deletes a task', () => {
    const task = repo.create({
      project_id: projectId,
      title: 'Delete Me',
      status: 'pending',
      priority: 'medium',
    })

    expect(repo.delete(task.id)).toBe(true)
    expect(repo.findById(task.id)).toBeNull()
  })

  it('returns false deleting nonexistent task', () => {
    expect(repo.delete('nonexistent')).toBe(false)
  })
})
