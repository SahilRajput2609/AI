import { describe, it, expect, beforeAll } from 'vitest'
import Database from 'better-sqlite3'
import { AgentRepository } from './agent.repository.js'

function createTestDb() {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'idle',
      icon TEXT,
      color TEXT,
      subtext TEXT,
      current_task_id TEXT,
      metadata TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  return db
}

describe('AgentRepository', () => {
  let repo: AgentRepository

  beforeAll(() => {
    repo = new AgentRepository(createTestDb())
  })

  it('creates an agent', () => {
    const agent = repo.create({
      role: 'coder',
      icon: 'code',
      color: 'blue',
      subtext: 'Writes code',
      metadata: { language: 'TypeScript' },
    })

    expect(agent.id).toBeTruthy()
    expect(agent.role).toBe('coder')
    expect(agent.status).toBe('idle')
    expect(agent.metadata).toEqual({ language: 'TypeScript' })
  })

  it('finds agent by id', () => {
    const created = repo.create({ role: 'planner' })
    const found = repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.role).toBe('planner')
  })

  it('finds agent by role', () => {
    const found = repo.findByRole('coder')
    expect(found).not.toBeNull()
    expect(found!.role).toBe('coder')
  })

  it('returns null for unknown role', () => {
    expect(repo.findByRole('nonexistent')).toBeNull()
  })

  it('finds all agents', () => {
    const all = repo.findAll()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })

  it('updates an agent', () => {
    const agent = repo.create({ role: 'reviewer' })
    const updated = repo.update(agent.id, { status: 'running', metadata: { reviewing: true } })
    expect(updated!.status).toBe('running')
    expect(updated!.metadata).toEqual({ reviewing: true })
  })

  it('deletes an agent', () => {
    const agent = repo.create({ role: 'tester' })
    expect(repo.delete(agent.id)).toBe(true)
    expect(repo.findById(agent.id)).toBeNull()
  })
})
