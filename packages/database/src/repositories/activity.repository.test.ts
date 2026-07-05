import { describe, it, expect, beforeAll } from 'vitest'
import Database from 'better-sqlite3'
import { ActivityRepository } from './activity.repository.js'

function createTestDb() {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      agent_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      metadata TEXT,
      created_at INTEGER NOT NULL
    )
  `)
  return db
}

describe('ActivityRepository', () => {
  let repo: ActivityRepository

  beforeAll(() => {
    repo = new ActivityRepository(createTestDb())
  })

  it('creates an activity entry', () => {
    const activity = repo.create({
      project_id: 'project-1',
      agent_id: 'agent-1',
      type: 'agent',
      title: 'Task started',
      description: 'Agent began working on task',
    })

    expect(activity.id).toBeTruthy()
    expect(activity.type).toBe('agent')
    expect(activity.title).toBe('Task started')
    expect(activity.metadata).toEqual({})
  })

  it('finds activity by id', () => {
    const created = repo.create({
      project_id: 'project-1',
      type: 'system',
      title: 'System event',
    })

    const found = repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.title).toBe('System event')
  })

  it('finds activity by project', () => {
    const items = repo.findByProject('project-1')
    expect(items.length).toBeGreaterThanOrEqual(2)
  })

  it('finds activity by agent', () => {
    const items = repo.findByAgent('agent-1')
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('agent')
  })

  it('finds activity by type', () => {
    const systemEvents = repo.findByType('project-1', 'system')
    expect(systemEvents.length).toBe(1)
  })

  it('respects limit parameter', () => {
    for (let i = 0; i < 5; i++) {
      repo.create({
        project_id: 'project-2',
        type: 'user',
        title: `Event ${i}`,
      })
    }
    const items = repo.findByProject('project-2', 3)
    expect(items.length).toBe(3)
  })

  it('deletes activity by id', () => {
    const activity = repo.create({
      project_id: 'project-1',
      type: 'git',
      title: 'Commit',
    })

    expect(repo.delete(activity.id)).toBe(true)
    expect(repo.findById(activity.id)).toBeNull()
  })

  it('deletes all activity for a project', () => {
    repo.create({ project_id: 'project-3', type: 'system', title: 'A' })
    repo.create({ project_id: 'project-3', type: 'system', title: 'B' })

    const count = repo.deleteByProject('project-3')
    expect(count).toBe(2)
  })
})
