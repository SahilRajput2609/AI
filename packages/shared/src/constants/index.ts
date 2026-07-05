// Application constants

export const APP_NAME = 'AI-Company'
export const APP_VERSION = '1.0.0'

// API
export const API_BASE_URL = 'http://localhost:3001'
export const WS_BASE_URL = 'ws://localhost:3001'

// Defaults
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_DEBOUNCE_MS = 300
export const DEFAULT_TIMEOUT_MS = 30000

// Limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_MESSAGE_LENGTH = 5000
export const MAX_TASK_TITLE_LENGTH = 200
export const MAX_TASK_DESCRIPTION_LENGTH = 2000

// Agent settings
export const AGENT_ROLES = [
  'owner',
  'planner',
  'orchestrator',
  'coder',
  'reviewer',
  'frontend',
  'backend',
  'api',
  'database',
  'qa',
  'debugger',
  'devops',
  'documentation',
] as const

export const AGENT_STATUS_COLORS = {
  online: '#22C55E',
  offline: '#64748B',
  idle: '#94A3B8',
  running: '#3B82F6',
  error: '#EF4444',
} as const

// Task settings
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'] as const

// UI settings
export const NOTIFICATION_DURATION = 5000
export const TOAST_DURATION = 3000

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ai_company_auth_token',
  USER: 'ai_company_user',
  THEME: 'ai_company_theme',
  PROJECTS: 'ai_company_projects',
  RECENT_FILES: 'ai_company_recent_files',
} as const

// WebSocket events
export const WS_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  AGENT_STATUS_CHANGED: 'agent_status_changed',
  TASK_UPDATED: 'task_updated',
  ACTIVITY_ADDED: 'activity_added',
  NOTIFICATION: 'notification',
  METRICS_UPDATED: 'metrics_updated',
  ERROR: 'error',
} as const
