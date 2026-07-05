import Database from 'better-sqlite3'
import { join, sep } from 'path'
import { existsSync, mkdirSync } from 'fs'

export class DatabaseConnection {
  private db: Database.Database
  private static instance: DatabaseConnection

  private constructor(dbPath: string) {
    const dir = dbPath.substring(0, dbPath.lastIndexOf('/') > 0 ? dbPath.lastIndexOf('/') : dbPath.lastIndexOf('\\'))
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.initialize()
  }

  static getInstance(dbPath = './data/ai-company.db'): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(dbPath)
    }
    return DatabaseConnection.instance
  }

  getDb(): Database.Database {
    return this.db
  }

  private initialize(): void {
    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        path TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // Tasks table
    this.db.exec(`
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

    // Agents table
    this.db.exec(`
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
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (current_task_id) REFERENCES tasks(id) ON DELETE SET NULL
      )
    `)

    // Activity/Timeline table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        agent_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
      )
    `)

    // Memory/Session table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory (
        id TEXT PRIMARY KEY,
        agent_id TEXT,
        type TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `)

    // Files metadata table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        path TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        language TEXT,
        size INTEGER,
        modified BOOLEAN DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `)

    // Model providers table
    this.db.exec(`
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

    // Model entities table
    this.db.exec(`
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

    // Agent configurations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_configs (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        api_key TEXT NOT NULL DEFAULT '',
        base_url TEXT NOT NULL DEFAULT '',
        model TEXT NOT NULL DEFAULT '',
        temperature REAL NOT NULL DEFAULT 0.7,
        max_tokens INTEGER NOT NULL DEFAULT 4096,
        is_active INTEGER NOT NULL DEFAULT 1,
        metadata TEXT NOT NULL DEFAULT '{}',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // Notifications table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL DEFAULT '',
        is_read INTEGER NOT NULL DEFAULT 0,
        timestamp INTEGER NOT NULL
      )
    `)

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_agent ON tasks(assigned_agent);
      CREATE INDEX IF NOT EXISTS idx_activity_project ON activity(project_id);
      CREATE INDEX IF NOT EXISTS idx_activity_agent ON activity(agent_id);
      CREATE INDEX IF NOT EXISTS idx_memory_agent ON memory(agent_id);
      CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
      CREATE INDEX IF NOT EXISTS idx_model_providers_provider ON model_providers(provider);
      CREATE INDEX IF NOT EXISTS idx_model_entities_provider ON model_entities(provider);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_configs_role ON agent_configs(role);
    `)
  }

  close(): void {
    this.db.close()
  }
}

export const getDatabase = (dbPath?: string) => DatabaseConnection.getInstance(dbPath)
