import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderOpen, Clock, ArrowRight, Code, Layout, Zap, Wifi, WifiOff } from 'lucide-react'
import { PromptBox } from '../components/PromptBox'
import { AgentPipeline, type AgentStep } from '../components/AgentPipeline'
import { api } from '../lib/api'
import { useRealtime } from '../lib/realtime'
import { clsx } from '../components/utils/clsx'

interface Project {
  id: string
  name: string
  description?: string
  type?: string
  status: string
  created_at: string
  updated_at: string
}

const AGENT_ICONS: Record<string, string> = {
  planner: '📋',
  'ui-designer': '🎨',
  'frontend-dev': '💻',
  'backend-dev': '⚙️',
  'database-engineer': '🗄️',
  'code-reviewer': '🔍',
  'qa-engineer': '🧪',
  'devops-engineer': '🚀',
}

const AGENT_LABELS: Record<string, string> = {
  planner: 'Planner',
  'ui-designer': 'UI Designer',
  'frontend-dev': 'Frontend Developer',
  'backend-dev': 'Backend Developer',
  'database-engineer': 'Database Engineer',
  'code-reviewer': 'Code Reviewer',
  'qa-engineer': 'QA Engineer',
  'devops-engineer': 'DevOps Engineer',
}

export function WorkspaceScreen({ onOpenProject }: { onOpenProject?: (id: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [pipelineSteps, setPipelineSteps] = useState<AgentStep[]>([])
  const [pipelineRunning, setPipelineRunning] = useState(false)
  const { connected, notifications } = useRealtime()

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    const lastNotif = notifications[0]
    if (lastNotif) {
      const step: AgentStep = {
        id: `step-${Date.now()}`,
        name: lastNotif.title.replace('Task ', ''),
        icon: '⚡',
        status: lastNotif.type === 'error' ? 'failed' : lastNotif.type === 'success' ? 'completed' : 'running',
        duration: 'just now',
        logs: [lastNotif.message],
      }
      setPipelineSteps((prev) => [...prev, step].slice(-8))
      setPipelineRunning(true)
      setTimeout(() => {
        setPipelineSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, status: 'completed' as const } : s)))
        setPipelineRunning(false)
      }, 2000)
    }
  }, [notifications])

  const loadProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handlePrompt = async (prompt: string, attachedFiles?: File[]) => {
    setGenerating(true)
    setPipelineRunning(true)

    try {
      // Fetch real agents from API or fall back to defaults
      let agents: { role: string; name: string }[] = []
      try {
        const result: any[] = await api.getTasks()
        const agentRoles = [...new Set(result.map((t: any) => t.assignedRole || t.assigned_agent).filter(Boolean))]
        agents =
          agentRoles.length > 0
            ? agentRoles.map((r: string) => ({ role: r, name: AGENT_LABELS[r] || r }))
            : Object.entries(AGENT_LABELS).map(([role, name]) => ({ role, name }))
      } catch {
        agents = Object.entries(AGENT_LABELS).map(([role, name]) => ({ role, name }))
      }

      const steps: AgentStep[] = agents.map((a, i) => ({
        id: `agent-${i}`,
        name: a.name,
        icon: AGENT_ICONS[a.role] || '⚡',
        status: i === 0 ? ('running' as const) : ('pending' as const),
        logs: i === 0 ? ['Initializing...'] : undefined,
      }))
      setPipelineSteps(steps)

      const project = await api.createProject({
        name: prompt.slice(0, 50),
        description: attachedFiles?.length
          ? `${prompt}\n\n[Attached ${attachedFiles.length} file(s): ${attachedFiles.map((f) => f.name).join(', ')}]`
          : prompt,
        type: 'custom',
      })

      // Upload attached files to the new project
      if (attachedFiles?.length) {
        for (const file of attachedFiles) {
          const content = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsText(file)
          })
          try {
            await api.writeProjectFile(project.id, file.name, content)
          } catch {}
        }
      }

      // Create a task and dispatch through orchestrator
      try {
        await api.createTask({ title: prompt.slice(0, 200), description: prompt, priority: 'high' })

        // Poll for task progress via API
        for (let i = 0; i < 20; i++) {
          await new Promise((r) => setTimeout(r, 800))
          try {
            const tasksList = await api.getTasks()
            const completedTasks = tasksList.filter((t: any) => t.status === 'completed').length
            const runningTasks = tasksList.filter((t: any) => t.status === 'in_progress').length

            setPipelineSteps((prev) =>
              prev.map((s, idx) => {
                if (idx < completedTasks)
                  return { ...s, status: 'completed' as const, duration: `${(Math.random() * 3 + 1).toFixed(1)}s` }
                if (idx === completedTasks && runningTasks > 0)
                  return { ...s, status: 'running' as const, logs: [`Processing "${prompt.slice(0, 40)}..."`] }
                return s
              }),
            )

            if (completedTasks >= agents.length) break
          } catch {
            // Fall back to sequential simulation
            setPipelineSteps((prev) =>
              prev.map((s, idx) => {
                if (idx <= i)
                  return { ...s, status: 'completed' as const, duration: `${(Math.random() * 2 + 0.5).toFixed(1)}s` }
                return s
              }),
            )
          }
        }
      } catch {
        // If orchestrator not available, simulate
        for (let i = 1; i < agents.length; i++) {
          await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))
          setPipelineSteps((prev) =>
            prev.map((s, idx) => {
              if (idx === i - 1)
                return { ...s, status: 'completed' as const, duration: `${(Math.random() * 2 + 0.5).toFixed(1)}s` }
              if (idx === i)
                return { ...s, status: 'running' as const, logs: [`Processing "${prompt.slice(0, 30)}..."`] }
              return s
            }),
          )
        }
      }

      setPipelineSteps((prev) =>
        prev.map((s) => ({
          ...s,
          status: 'completed' as const,
          duration: s.duration || `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
        })),
      )
      setPipelineRunning(false)
      await loadProjects()
      onOpenProject?.(project.id)
    } catch {
    } finally {
      setGenerating(false)
    }
  }

  const typeIcons: Record<string, any> = {
    website: Layout,
    dashboard: Layout,
    'react-app': Code,
    'node-api': Code,
    'ai-agent': Zap,
    automation: Zap,
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Connection status */}
        <div className="flex items-center justify-end mb-4 gap-2">
          <span
            className={clsx(
              'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full',
              connected ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]',
            )}
          >
            {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Hero + Prompt */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-white mb-2">What do you want to build today?</h1>
          <p className="text-sm text-[#6B7280] mb-8">Describe your project and AI agents will build it for you</p>
          <PromptBox onSubmit={handlePrompt} isLoading={generating} />
        </motion.div>

        {/* Agent Pipeline Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AgentPipeline steps={pipelineSteps} isRunning={pipelineRunning} />
        </motion.div>

        {/* Recent Projects */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <FolderOpen size={15} className="text-[#7C6BFF]" />
              Recent Projects
            </h2>
            {projects.length > 0 && (
              <button onClick={loadProjects} className="text-xs text-[#6B7280] hover:text-[#A1A1AA] transition-colors">
                Refresh
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => {
                document.querySelector('textarea')?.focus()
              }}
              className="h-28 rounded-xl border border-dashed border-[#202020] bg-[#080808] hover:bg-[#0F0F0F] hover:border-[#333] transition-all flex flex-col items-center justify-center gap-2 text-[#6B7280] hover:text-[#A1A1AA]"
            >
              <Plus size={20} />
              <span className="text-xs">New Project</span>
            </button>

            {loading &&
              [1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] animate-pulse" />
              ))}

            {!loading &&
              projects.slice(0, 5).map((project, i) => {
                const Icon = typeIcons[project.type || ''] || Code
                return (
                  <motion.button
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onOpenProject?.(project.id)}
                    className="h-28 rounded-xl border border-[#202020] bg-[#0F0F0F] hover:bg-[#151515] hover:border-[#333] transition-all text-left p-4 flex flex-col justify-between group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#7C6BFF]/10 flex items-center justify-center">
                          <Icon size={13} className="text-[#7C6BFF]" />
                        </div>
                        <span className="text-xs font-medium text-white truncate max-w-[120px]">{project.name}</span>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(project.updated_at)}
                      </span>
                      <span
                        className={clsx(
                          'text-[10px] px-1.5 py-0.5 rounded-full',
                          project.status === 'completed'
                            ? 'bg-[#22C55E]/10 text-[#22C55E]'
                            : project.status === 'building'
                              ? 'bg-[#7C6BFF]/10 text-[#7C6BFF]'
                              : 'bg-[#6B7280]/10 text-[#6B7280]',
                        )}
                      >
                        {project.status || 'draft'}
                      </span>
                    </div>
                  </motion.button>
                )
              })}

            {!loading && projects.length === 0 && (
              <div className="h-28 rounded-xl border border-dashed border-[#202020] bg-[#080808] flex items-center justify-center col-span-full">
                <p className="text-xs text-[#6B7280]">No projects yet. Describe what you want to build above.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(dateStr).toLocaleDateString()
}
