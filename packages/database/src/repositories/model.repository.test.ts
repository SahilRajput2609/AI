import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { ModelRepository } from './model.repository.js'

describe('ModelRepository', () => {
  let db: Database.Database
  let repo: ModelRepository

  beforeAll(() => {
    db = new Database(':memory:')
    db.exec(`
      CREATE TABLE IF NOT EXISTS model_entities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        model_id TEXT NOT NULL,
        capabilities TEXT NOT NULL DEFAULT '[]',
        max_tokens INTEGER NOT NULL DEFAULT 4096,
        cost_per_1m_tokens INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 0,
        config TEXT NOT NULL DEFAULT '{}',
        updated_at INTEGER
      )
    `)
    repo = new ModelRepository(db)
  })

  afterAll(() => {
    db.close()
  })

  beforeEach(() => {
    db.prepare('DELETE FROM model_entities').run()
  })

  it('creates a model', async () => {
    const model = await repo.create({
      name: 'GPT-4',
      provider: 'openai',
      modelId: 'gpt-4',
      capabilities: ['chat', 'code'],
      maxTokens: 8192,
      costPer1MTokens: 30,
      isActive: true,
      config: { temperature: 0.7 },
    })

    expect(model.id).toBeTruthy()
    expect(model.name).toBe('GPT-4')
    expect(model.isActive).toBe(true)
  })

  it('finds model by id', async () => {
    const created = await repo.create({
      name: 'Claude 3',
      provider: 'anthropic',
      modelId: 'claude-3',
      capabilities: ['chat'],
      maxTokens: 100000,
      costPer1MTokens: 15,
      isActive: true,
      config: {},
    })

    const found = await repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.name).toBe('Claude 3')
  })

  it('finds all models with optional filters', async () => {
    await repo.create({
      name: 'Model A',
      provider: 'openai',
      modelId: 'a',
      capabilities: [],
      maxTokens: 1000,
      costPer1MTokens: 10,
      isActive: true,
      config: {},
    })

    await repo.create({
      name: 'Model B',
      provider: 'anthropic',
      modelId: 'b',
      capabilities: [],
      maxTokens: 2000,
      costPer1MTokens: 20,
      isActive: false,
      config: {},
    })

    const all = await repo.findAll()
    expect(all.length).toBe(2)

    const openai = await repo.findAll({ provider: 'openai' })
    expect(openai.length).toBe(1)

    const active = await repo.findAll({ isActive: true })
    const inactive = await repo.findAll({ isActive: false })
    expect(active.length).toBe(1)
    expect(inactive.length).toBe(1)
  })

  it('updates a model', async () => {
    const model = await repo.create({
      name: 'Update Model',
      provider: 'openai',
      modelId: 'update-v1',
      capabilities: ['chat'],
      maxTokens: 4096,
      costPer1MTokens: 20,
      isActive: false,
      config: {},
    })

    const updated = await repo.update(model.id, { isActive: true, maxTokens: 8192 })
    expect(updated!.isActive).toBe(true)
    expect(updated!.maxTokens).toBe(8192)
  })

  it('deletes a model', async () => {
    const model = await repo.create({
      name: 'Delete Model',
      provider: 'openai',
      modelId: 'delete-v1',
      capabilities: [],
      maxTokens: 1000,
      costPer1MTokens: 5,
      isActive: true,
      config: {},
    })

    expect(await repo.delete(model.id)).toBe(true)
    expect(await repo.findById(model.id)).toBeNull()
  })
})
