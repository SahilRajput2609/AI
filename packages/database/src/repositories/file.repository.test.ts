import { describe, it, expect, beforeAll } from 'vitest'
import Database from 'better-sqlite3'
import { FileRepository } from './file.repository.js'

function createTestDb() {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      path TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      language TEXT,
      size INTEGER,
      modified INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  return db
}

describe('FileRepository', () => {
  let repo: FileRepository

  beforeAll(() => {
    repo = new FileRepository(createTestDb())
  })

  it('creates a file record', () => {
    const file = repo.create({
      project_id: 'project-1',
      path: 'src/index.ts',
      name: 'index.ts',
      type: 'file',
      language: 'typescript',
      size: 1024,
    })

    expect(file.id).toBeTruthy()
    expect(file.name).toBe('index.ts')
    expect(file.modified).toBe(false)
  })

  it('finds file by id', () => {
    const created = repo.create({
      project_id: 'project-1',
      path: 'README.md',
      name: 'README.md',
      type: 'file',
    })

    const found = repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.name).toBe('README.md')
  })

  it('finds file by path', () => {
    const found = repo.findByPath('project-1', 'src/index.ts')
    expect(found).not.toBeNull()
    expect(found!.language).toBe('typescript')
  })

  it('returns null for unknown path', () => {
    expect(repo.findByPath('project-1', 'nope.ts')).toBeNull()
  })

  it('finds files by project', () => {
    const files = repo.findByProject('project-1')
    expect(files.length).toBeGreaterThanOrEqual(2)
  })

  it('finds modified files', () => {
    const file = repo.create({
      project_id: 'project-1',
      path: 'modified.ts',
      name: 'modified.ts',
      type: 'file',
      modified: true,
    })

    repo.update(file.id, { modified: true })

    const modified = repo.findModified('project-1')
    expect(modified.length).toBeGreaterThanOrEqual(1)
    expect(modified.some(f => f.path === 'modified.ts')).toBe(true)
  })

  it('updates a file record', () => {
    const file = repo.create({
      project_id: 'project-1',
      path: 'update.ts',
      name: 'update.ts',
      type: 'file',
      language: 'typescript',
      size: 500,
    })

    const updated = repo.update(file.id, { size: 1000, modified: true })
    expect(updated!.size).toBe(1000)
    expect(updated!.modified).toBe(true)
  })

  it('deletes a file', () => {
    const file = repo.create({
      project_id: 'project-1',
      path: 'delete.ts',
      name: 'delete.ts',
      type: 'file',
    })

    expect(repo.delete(file.id)).toBe(true)
    expect(repo.findById(file.id)).toBeNull()
  })

  it('deletes all files for a project', () => {
    repo.create({ project_id: 'project-2', path: 'a.ts', name: 'a.ts', type: 'file' })
    repo.create({ project_id: 'project-2', path: 'b.ts', name: 'b.ts', type: 'file' })

    expect(repo.deleteByProject('project-2')).toBe(2)
  })
})
