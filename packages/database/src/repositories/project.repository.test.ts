import { describe, it, expect, beforeAll } from 'vitest'
import Database from 'better-sqlite3'
import { ProjectRepository } from './project.repository.js'

function createTestDb() {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      type TEXT NOT NULL DEFAULT 'custom',
      model TEXT DEFAULT '',
      framework TEXT DEFAULT '',
      user_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  return db
}

describe('ProjectRepository', () => {
  let repo: ProjectRepository

  beforeAll(() => {
    const db = createTestDb()
    repo = new ProjectRepository(db)
  })

  it('creates a project', () => {
    const project = repo.create({
      name: 'Test Project',
      description: 'A test project',
      path: '/projects/test',
      status: 'active',
      type: 'custom',
    })

    expect(project.id).toBeTruthy()
    expect(project.name).toBe('Test Project')
    expect(project.status).toBe('active')
    expect(project.created_at).toBeGreaterThan(0)
    expect(project.updated_at).toBeGreaterThan(0)
  })

  it('finds project by id', () => {
    const created = repo.create({
      name: 'Find Me',
      path: '/projects/find-me',
      status: 'active',
      type: 'custom',
    })

    const found = repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.name).toBe('Find Me')
  })

  it('returns null when project not found', () => {
    const found = repo.findById('nonexistent')
    expect(found).toBeNull()
  })

  it('finds all projects', () => {
    const all = repo.findAll()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })

  it('updates a project', () => {
    const project = repo.create({
      name: 'Update Me',
      path: '/projects/update-me',
      status: 'active',
      type: 'custom',
    })

    const updated = repo.update(project.id, { name: 'Updated', status: 'paused' })
    expect(updated).not.toBeNull()
    expect(updated!.name).toBe('Updated')
    expect(updated!.status).toBe('paused')
    expect(updated!.updated_at).toBeGreaterThanOrEqual(project.updated_at)
  })

  it('returns null updating nonexistent project', () => {
    const result = repo.update('nonexistent', { name: 'Nope' })
    expect(result).toBeNull()
  })

  it('deletes a project', () => {
    const project = repo.create({
      name: 'Delete Me',
      path: '/projects/delete-me',
      status: 'active',
      type: 'custom',
    })

    const deleted = repo.delete(project.id)
    expect(deleted).toBe(true)

    const found = repo.findById(project.id)
    expect(found).toBeNull()
  })

  it('returns false deleting nonexistent project', () => {
    const result = repo.delete('nonexistent')
    expect(result).toBe(false)
  })
})
