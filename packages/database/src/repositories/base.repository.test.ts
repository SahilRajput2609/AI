import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { BaseRepository } from './base.repository.js'

interface TestEntity {
  id: string
  name: string
  value: number
}

describe('BaseRepository', () => {
  let db: Database.Database
  let repo: BaseRepository<TestEntity>

  beforeAll(() => {
    db = new Database(':memory:')
    db.exec(`
      CREATE TABLE IF NOT EXISTS test_entity (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        value INTEGER NOT NULL
      )
    `)
    repo = new BaseRepository<TestEntity>('test_entity', db)
  })

  afterAll(() => {
    db.close()
  })

  beforeEach(() => {
    db.prepare('DELETE FROM test_entity').run()
  })

  it('creates an entity with generated id', async () => {
    const item = await repo.create({ name: 'test', value: 42 })
    expect(item.id).toMatch(/^test_entity_\d+_[a-z0-9]+$/)
    expect(item.name).toBe('test')
    expect(item.value).toBe(42)
  })

  it('finds entity by id', async () => {
    const created = await repo.create({ name: 'find-me', value: 1 })
    const found = await repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.name).toBe('find-me')
  })

  it('returns null for unknown id', async () => {
    expect(await repo.findById('unknown')).toBeNull()
  })

  it('finds all entities', async () => {
    await repo.create({ name: 'a', value: 1 })
    await repo.create({ name: 'b', value: 2 })

    const all = await repo.findAll()
    expect(all.length).toBe(2)
  })

  it('updates an entity', async () => {
    const created = await repo.create({ name: 'update-me', value: 10 })
    const updated = await repo.update(created.id, { value: 20 })
    expect(updated).not.toBeNull()
    expect(updated!.value).toBe(20)
    expect(updated!.name).toBe('update-me')
  })

  it('returns null updating unknown entity', async () => {
    expect(await repo.update('unknown', { name: 'nope' })).toBeNull()
  })

  it('deletes an entity', async () => {
    const created = await repo.create({ name: 'delete-me', value: 0 })
    expect(await repo.delete(created.id)).toBe(true)
    expect(await repo.findById(created.id)).toBeNull()
  })

  it('returns false deleting unknown entity', async () => {
    expect(await repo.delete('unknown')).toBe(false)
  })
})
