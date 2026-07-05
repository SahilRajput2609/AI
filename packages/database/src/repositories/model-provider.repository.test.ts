import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { ModelProviderRepository } from './model-provider.repository.js'

describe('ModelProviderRepository', () => {
  let db: Database.Database
  let repo: ModelProviderRepository

  beforeAll(() => {
    db = new Database(':memory:')
    db.exec(`
      CREATE TABLE IF NOT EXISTS model_providers (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        name TEXT NOT NULL,
        base_url TEXT NOT NULL DEFAULT '',
        api_key TEXT NOT NULL DEFAULT '',
        is_active INTEGER NOT NULL DEFAULT 0,
        models TEXT NOT NULL DEFAULT '[]',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)
    repo = new ModelProviderRepository(db)
  })

  afterAll(() => {
    db.close()
  })

  beforeEach(() => {
    db.prepare('DELETE FROM model_providers').run()
  })

  it('creates a provider config', async () => {
    const config = await repo.createProvider({
      provider: 'openai',
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com',
      apiKey: 'sk-test',
      isActive: true,
      models: [{ id: 'gpt-4', name: 'GPT-4', modelId: 'gpt-4', providerId: '', capabilities: ['chat'], maxTokens: 8192, costPer1MTokens: 30, isActive: true }],
    })

    expect(config.id).toMatch(/^model-provider_\d+_[a-z0-9]+$/)
    expect(config.isActive).toBe(true)
    expect(config.createdAt).toBeInstanceOf(Date)
  })

  it('returns null for unknown provider', async () => {
    expect(await repo.getProvider('unknown')).toBeNull()
  })

  it('gets created provider by id', async () => {
    const created = await repo.createProvider({
      provider: 'anthropic',
      name: 'Anthropic',
      baseUrl: 'https://api.anthropic.com',
      apiKey: 'sk-test-2',
      isActive: false,
      models: [],
    })

    const found = await repo.getProvider(created.id)
    expect(found).not.toBeNull()
    expect(found!.name).toBe('Anthropic')
  })

  it('gets all providers', async () => {
    await repo.createProvider({
      provider: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com', apiKey: 'sk-1', isActive: true, models: [],
    })
    await repo.createProvider({
      provider: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com', apiKey: 'sk-2', isActive: false, models: [],
    })

    const all = await repo.getAllProviders()
    expect(all.length).toBe(2)
  })

  it('gets active providers', async () => {
    await repo.createProvider({
      provider: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com', apiKey: 'sk-1', isActive: true, models: [],
    })
    await repo.createProvider({
      provider: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com', apiKey: 'sk-2', isActive: false, models: [],
    })

    const active = await repo.getActiveProviders()
    expect(active.length).toBe(1)
    expect(active[0].isActive).toBe(true)
  })

  it('updates a provider', async () => {
    const created = await repo.createProvider({
      provider: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com', apiKey: 'sk-test', isActive: true, models: [],
    })

    const updated = await repo.updateProvider(created.id, { isActive: false, baseUrl: 'https://updated.openai.com' })
    expect(updated).not.toBeNull()
    expect(updated!.isActive).toBe(false)
    expect(updated!.baseUrl).toBe('https://updated.openai.com')
  })

  it('returns null updating nonexistent provider', async () => {
    expect(await repo.updateProvider('nonexistent', { isActive: true })).toBeNull()
  })

  it('deletes a provider', async () => {
    const created = await repo.createProvider({
      provider: 'openai', name: 'Delete Me', baseUrl: 'https://api.openai.com', apiKey: 'sk-test', isActive: true, models: [],
    })

    expect(await repo.deleteProvider(created.id)).toBe(true)
    expect(await repo.getProvider(created.id)).toBeNull()
  })

  it('returns false deleting nonexistent provider', async () => {
    expect(await repo.deleteProvider('unknown')).toBe(false)
  })

  it('finds provider by name', async () => {
    const created = await repo.createProvider({
      provider: 'google', name: 'Google AI', baseUrl: 'https://generativelanguage.googleapis.com', apiKey: 'sk-test-3', isActive: true, models: [],
    })

    const found = await repo.getProviderByName('Google AI')
    expect(found).not.toBeNull()
    expect(found!.provider).toBe('google')
  })

  it('finds provider by type', async () => {
    await repo.createProvider({
      provider: 'google', name: 'Google AI', baseUrl: 'https://generativelanguage.googleapis.com', apiKey: 'sk-test', isActive: true, models: [],
    })

    const providers = await repo.getProvidersByType('google')
    expect(providers.length).toBe(1)
  })

  it('finds provider by status', async () => {
    await repo.createProvider({
      provider: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com', apiKey: 'sk-1', isActive: true, models: [],
    })
    await repo.createProvider({
      provider: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com', apiKey: 'sk-2', isActive: false, models: [],
    })

    const active = await repo.findByStatus('active')
    const inactiveResults = await repo.findByStatus('inactive')
    expect(active.length).toBe(1)
    expect(inactiveResults.length).toBe(1)
  })

  it('finds provider by provider name', async () => {
    await repo.createProvider({
      provider: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com', apiKey: 'sk-test', isActive: true, models: [],
    })

    const results = await repo.findByProvider('openai')
    expect(results.length).toBe(1)
    expect(results[0].provider).toBe('openai')
  })
})
