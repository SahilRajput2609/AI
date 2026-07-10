// src/utils/history.ts
import type { HistoryEntry } from '../components/workspace/ProjectHistoryPanel'

const STORAGE_KEY = 'ai-company-project-history'

export interface AddEntryParams {
  prompt: string
  outcome: 'completed' | 'rejected'
}

export function addEntry(params: AddEntryParams): void {
  const entry: HistoryEntry = {
    prompt: params.prompt,
    outcome: params.outcome,
    timestamp: new Date().toISOString(),
  }

  const history = getHistory()
  history.unshift(entry)

  persistHistory(history)
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function persistHistory(history: HistoryEntry[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {}
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
