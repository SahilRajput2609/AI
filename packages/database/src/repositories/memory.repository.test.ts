import { describe, it, expect, beforeAll } from 'vitest'
import Database from 'better-sqlite3'
import { MemoryRepository } from './memory.repository.js'

function createTestDb() {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE IF NOT EXISTS memory (
      id TEXT PRIMARY KEY,
      agent_id TEXT,
      type TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      metadata TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  return db
}

describe('MemoryRepository', () => {
  let repo: MemoryRepository

  beforeAll(() => {
    repo = new MemoryRepository(createTestDb())
  })

  it('creates a memory entry', () => {
    const mem = repo.create({
      type: 'global',
      key: 'app-version',
      value: '1.0.0',
    })

    expect(mem.id).toBeTruthy()
    expect(mem.type).toBe('global')
    expect(mem.key).toBe('app-version')
    expect(mem.value).toBe('1.0.0')
    expect(mem.metadata).toEqual({})
  })

  it('finds memory by id', () => {
    const created = repo.create({ type: 'agent', key: 'pref', value: 'dark', agent_id: 'agent-1' })
    const found = repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.key).toBe('pref')
  })

  it('finds memory by key', () => {
    const result = repo.findByKey('global', 'app-version')
    expect(result).not.toBeNull()
    expect(result!.value).toBe('1.0.0')
  })

  it('finds memory by key with agent scoping', () => {
    repo.create({ type: 'agent', key: 'theme', value: 'light', agent_id: 'agent-2' })
    const result = repo.findByKey('agent', 'theme', 'agent-2')
    expect(result).not.toBeNull()
    expect(result!.value).toBe('light')

    const notFound = repo.findByKey('agent', 'theme', 'agent-3')
    expect(notFound).toBeNull()
  })

  it('finds memory by agent', () => {
    const items = repo.findByAgent('agent-1')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('finds memory by type', () => {
    const items = repo.findByType('global')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('upserts creates new memory if not exists', () => {
    const mem = repo.upsert({
      type: 'session',
      key: 'current-view',
      value: 'dashboard',
    })
    expect(mem.id).toBeTruthy()
    expect(mem.value).toBe('dashboard')
  })

  it('upserts updates existing memory', () => {
    const updated = repo.upsert({
      type: 'session',
      key: 'current-view',
      value: 'settings',
    })
    expect(updated.value).toBe('settings')
  })

  it('updates memory value and metadata', () => {
    const mem = repo.create({ type: 'agent', key: 'counter', value: '1', agent_id: 'agent-1' })
    const updated = repo.update(mem.id, { value: '2', metadata: { updated: true } })
    expect(updated!.value).toBe('2')
    expect(updated!.metadata).toEqual({ updated: true })
  })

  it('deletes memory by id', () => {
    const mem = repo.create({ type: 'global', key: 'temp', value: 'x' })
    expect(repo.delete(mem.id)).toBe(true)
  })

  it('deletes memory by agent', () => {
    const count = repo.deleteByAgent('agent-2')
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
