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
        timestamp INTEGER NOT NULL,
        user_id TEXT,
        project_id TEXT
      )
    `)

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        salt TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        oauth_provider TEXT,
        oauth_id TEXT,
        avatar_url TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // OAuth migration: add columns if missing (for existing databases)
    const userCols = this.db.prepare("PRAGMA table_info(users)").all() as { name: string }[]
    const userColNames = userCols.map(c => c.name)
    if (!userColNames.includes('oauth_provider')) {
      this.db.exec(`ALTER TABLE users ADD COLUMN oauth_provider TEXT`)
      this.db.exec(`ALTER TABLE users ADD COLUMN oauth_id TEXT`)
      this.db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT`)
    }

    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // API Keys table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        key TEXT NOT NULL UNIQUE,
        scopes TEXT NOT NULL DEFAULT '["read"]',
        last_used_at INTEGER,
        expires_at INTEGER,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'custom',
        type TEXT NOT NULL DEFAULT 'project',
        config TEXT NOT NULL DEFAULT '{}',
        is_built_in INTEGER NOT NULL DEFAULT 0,
        usage_count INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // Organizations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        avatar_url TEXT,
        owner_id TEXT NOT NULL,
        plan TEXT NOT NULL DEFAULT 'free',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `)

    // Organization members table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joined_at INTEGER NOT NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(organization_id, user_id)
      )
    `)

    // Versions/Snapshots table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS versions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        version_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        snapshot_data TEXT NOT NULL DEFAULT '{}',
        file_count INTEGER NOT NULL DEFAULT 0,
        created_by TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Deployments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS deployments (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        version_id TEXT,
        platform TEXT NOT NULL DEFAULT 'vercel',
        status TEXT NOT NULL DEFAULT 'pending',
        url TEXT,
        build_logs TEXT,
        config TEXT NOT NULL DEFAULT '{}',
        deployed_by TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (version_id) REFERENCES versions(id),
        FOREIGN KEY (deployed_by) REFERENCES users(id)
      )
    `)

    // Chat messages table (persistent)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        user_id TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        content TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Audit log table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        details TEXT DEFAULT '{}',
        ip_address TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // User settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        theme TEXT NOT NULL DEFAULT 'dark',
        auto_save INTEGER NOT NULL DEFAULT 1,
        default_project_name TEXT NOT NULL DEFAULT 'AI-Company',
        notify_task_updates INTEGER NOT NULL DEFAULT 1,
        notify_agent_errors INTEGER NOT NULL DEFAULT 1,
        notify_deployment_complete INTEGER NOT NULL DEFAULT 1,
        keyboard_shortcuts TEXT NOT NULL DEFAULT '{}',
        model_preferences TEXT NOT NULL DEFAULT '{}',
        agent_preferences TEXT NOT NULL DEFAULT '{}',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id)
      )
    `)

    // Add project_type column to projects if missing
    const projCols = this.db.prepare("PRAGMA table_info(projects)").all() as { name: string }[]
    const projColNames = projCols.map(c => c.name)
    if (!projColNames.includes('type')) {
      this.db.exec(`ALTER TABLE projects ADD COLUMN type TEXT NOT NULL DEFAULT 'custom'`)
    }
    if (!projColNames.includes('user_id')) {
      this.db.exec(`ALTER TABLE projects ADD COLUMN user_id TEXT`)
    }
    if (!projColNames.includes('model')) {
      this.db.exec(`ALTER TABLE projects ADD COLUMN model TEXT DEFAULT ''`)
    }
    if (!projColNames.includes('framework')) {
      this.db.exec(`ALTER TABLE projects ADD COLUMN framework TEXT DEFAULT ''`)
    }

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
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
      CREATE INDEX IF NOT EXISTS idx_versions_project ON versions(project_id);
      CREATE INDEX IF NOT EXISTS idx_deployments_project ON deployments(project_id);
      CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_project ON chat_messages(project_id);
      CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);
    `)
  }

  close(): void {
    this.db.close()
  }
}

export const getDatabase = (dbPath?: string) => DatabaseConnection.getInstance(dbPath)
