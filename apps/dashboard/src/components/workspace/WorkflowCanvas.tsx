import { useState, useEffect, useRef } from 'react'
import { Plus, ArrowRight, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { api as apiClient } from '../../lib/api'
import { useRealtime } from '../../lib/realtime'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { EmptyState } from '../ui/EmptyState'
import { SkeletonCard } from '../ui/Skeleton'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  progress?: number
  createdAt: Date | string
  updatedAt: Date | string
}

function formatTime(ts: Date | string): string {
  const timestamp = new Date(ts).getTime()
  const diff = Date.now() - timestamp
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed': return <Badge variant="success">Completed</Badge>
    case 'in_progress': return <Badge variant="warning">In Progress</Badge>
    case 'failed': return <Badge variant="error">Failed</Badge>
    default: return <Badge>Pending</Badge>
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle size={14} className="text-[#22C55E]" />
    case 'in_progress': return <Loader2 size={14} className="text-[#FACC15] animate-spin" />
    case 'failed': return <AlertCircle size={14} className="text-[#EF4444]" />
    default: return <Clock size={14} className="text-[#6E6E6E]" />
  }
}

export function WorkflowCanvas() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [creating, setCreating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { notifications } = useRealtime()

  useEffect(() => {
    apiClient.getTasks()
      .then((data: any) => setTasks(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [notifications])

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [prompt])

  const handleCreate = async () => {
    if (!prompt.trim() || creating) return
    setCreating(true)
    try {
      const task = await apiClient.createTask({
        title: prompt.trim().slice(0, 200),
        description: prompt.trim(),
      })
      setTasks((prev) => [task, ...prev])
      setPrompt('')
    } catch {
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="px-6 lg:px-12 pt-12 pb-8 max-w-3xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white mb-2">
          What would you like to build today?
        </h1>
        <p className="text-sm text-[#6E6E6E] mb-8">
          Describe your project, website, application, or idea. Our AI agents will handle the rest.
        </p>

        {/* Prompt input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleCreate()
              }
            }}
            placeholder="Describe your project, website, application, automation or idea..."
            rows={3}
            className="w-full bg-[#080808] border border-[#202020] rounded-xl px-5 py-4 text-sm text-white placeholder-[#6E6E6E] outline-none resize-none transition-all duration-150 focus:border-[#333] focus:ring-1 focus:ring-[#333]"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[#6E6E6E]">
              {prompt.length > 0 && `${prompt.length} characters`}
            </span>
            <button
              onClick={handleCreate}
              disabled={!prompt.trim() || creating}
              className="h-10 px-5 bg-white text-black text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Plus size={16} />
              )}
              Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="px-6 lg:px-12 pb-12 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[#A8A8A8]">Recent Tasks</h2>
          {tasks.length > 0 && (
            <span className="text-xs text-[#6E6E6E]">{tasks.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="grid gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Create your first task by describing what you'd like to build."
          />
        ) : (
          <div className="grid gap-2">
            {tasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-4 p-4 rounded-lg border border-[#202020] bg-[#0F0F0F] hover:border-[#333] hover:bg-[#151515] transition-all duration-150 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-white truncate">{task.title}</h3>
                    {getStatusBadge(task.status)}
                  </div>
                  {task.description && (
                    <p className="text-xs text-[#6E6E6E] truncate">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-[#6E6E6E]">{formatTime(task.createdAt)}</span>
                    {task.progress !== undefined && (
                      <div className="flex-1 max-w-[120px]">
                        <ProgressBar value={task.progress} />
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#6E6E6E] group-hover:text-[#A8A8A8] transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
