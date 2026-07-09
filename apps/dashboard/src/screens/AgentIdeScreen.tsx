import { useState, useEffect } from 'react'
import { Play, Terminal as TerminalIcon, Bot, ListTodo, Cpu } from 'lucide-react'
import { clsx } from '../components/utils/clsx'
import { api } from '../lib/api'
import { EmptyState } from '../components/ui/EmptyState'
import { Terminal } from '../components/Terminal'

export function AgentIdeScreen() {
  const [prompt, setPrompt] = useState('')
  const [tab, setTab] = useState<'terminal' | 'output'>('terminal')
  const [agents, setAgents] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [outputLogs, setOutputLogs] = useState<string[]>([])
  const [tasks, setTasks] = useState<{ description: string; assignedRole: string }[]>([])
  const [taskStatuses, setTaskStatuses] = useState<('queued' | 'running' | 'success' | 'failed')[]>([])

  useEffect(() => { fetchAgents() }, [])

  async function fetchAgents() {
    try { setAgents(await api.getAgents()) } catch {}
  }

  async function startDeployment() {
    if (isRunning || !prompt) return
    setIsRunning(true)
    setOutputLogs([`[SYSTEM] Connecting...`, `[SYSTEM] Creating task: "${prompt}"`])
    try {
      const task = await api.createTask({ title: prompt, description: prompt, priority: 'medium', category: 'general' })
      setOutputLogs((p) => [...p, `[OWNER] Task created: ${task.id}`])
      const plan = await api.createPlan(task.id, prompt)
      setOutputLogs((p) => [...p, `[PLANNER] Plan created: ${plan.id}`])
      const subtasks = (plan as any).subTasks || (plan as any).subtasks || []
      if (subtasks.length > 0) {
        setTasks(subtasks.map((s: any) => ({ description: s.description, assignedRole: s.assignedRole })))
        setTaskStatuses(subtasks.map(() => 'queued' as const))
      }
      setOutputLogs((p) => [...p, `[SYSTEM] Dispatching to agents...`])
      const state = await api.triggerDispatch()
      setOutputLogs((p) => [...p, `[SYSTEM] Dispatched ${state.queued?.length || 0} tasks`])
      setTaskStatuses((p) => p.map(() => 'success' as const))
    } catch (err: any) {
      setOutputLogs((p) => [...p, `[SYSTEM] Error: ${err?.message || 'Unknown error'}`])
    }
    setIsRunning(false)
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel */}
      <div className="w-[340px] flex-shrink-0 border-r border-[#202020] flex flex-col">
        <div className="px-4 py-3 border-b border-[#202020]">
          <h2 className="text-sm font-semibold text-white">Agent Console</h2>
          <p className="text-xs text-[#6E6E6E]">Deploy tasks to agent networks</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Prompt */}
          <div className="rounded-lg border border-[#202020] bg-[#080808] p-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isRunning}
              placeholder="Describe what you want to build..."
              className="w-full h-24 bg-transparent text-sm text-white placeholder-[#6E6E6E] outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#202020]">
              <span className="text-xs text-[#6E6E6E]">{agents.length} agents</span>
              <button
                onClick={startDeployment}
                disabled={isRunning || !prompt}
                className="h-8 px-3 bg-white text-black text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Play size={12} /> Deploy
              </button>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex gap-1 bg-[#0F0F0F] rounded-lg p-0.5">
            <button
              onClick={() => setTab('terminal')}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs transition-all',
                tab === 'terminal' ? 'bg-[#151515] text-white' : 'text-[#6B7280] hover:text-[#A1A1AA]',
              )}
            >
              <TerminalIcon size={13} /> Terminal
            </button>
            <button
              onClick={() => setTab('output')}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs transition-all',
                tab === 'output' ? 'bg-[#151515] text-white' : 'text-[#6B7280] hover:text-[#A1A1AA]',
              )}
            >
              <ListTodo size={13} /> Output
            </button>
          </div>

          {/* Agents list */}
          {agents.length > 0 && (
            <div>
              <p className="text-xs text-[#6E6E6E] mb-2 uppercase tracking-wider font-medium flex items-center gap-1">
                <Bot size={12} /> Agents
              </p>
              <div className="flex flex-wrap gap-1.5">
                {agents.map((a: any) => (
                  <span key={a.id || a.role} className="text-[11px] text-[#A8A8A8] bg-[#0F0F0F] border border-[#202020] px-2 py-1 rounded-md">
                    {a.name || a.role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Task progress */}
          {isRunning && tasks.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[#6E6E6E] uppercase tracking-wider font-medium flex items-center gap-1">
                <Cpu size={12} /> Progress
              </p>
              {tasks.map((task, idx) => {
                const status = taskStatuses[idx] || 'queued'
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={clsx(
                      'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      status === 'success' && 'bg-[#22C55E]',
                      status === 'running' && 'bg-[#FACC15] animate-pulse',
                      status === 'failed' && 'bg-[#EF4444]',
                      status === 'queued' && 'bg-[#333]',
                    )} />
                    <div>
                      <span className="text-xs text-[#6E6E6E] font-mono">{task.assignedRole}</span>
                      <p className="text-xs text-white">{task.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        {tab === 'terminal' ? (
          <Terminal />
        ) : (
          <>
            <div className="h-9 border-b border-[#202020] flex items-center px-4 gap-2 flex-shrink-0">
              <ListTodo size={12} className="text-[#6E6E6E]" />
              <span className="text-xs text-[#6E6E6E]">Output</span>
              {isRunning && (
                <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[#FACC15]">
                  <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-pulse" />
                  Running
                </span>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-[#000000]">
              {outputLogs.length > 0 ? (
                outputLogs.map((log, i) => {
                  let color = 'text-[#A8A8A8]'
                  if (log.includes('[SYSTEM]')) color = 'text-[#6E6E6E]'
                  if (log.includes('[OWNER]')) color = 'text-white'
                  if (log.includes('[PLANNER]')) color = 'text-[#A8A8A8]'
                  if (log.includes('Error')) color = 'text-[#EF4444]'
                  return <div key={i} className={clsx('leading-relaxed', color)}>{log}</div>
                })
              ) : (
                <EmptyState title="Ready" description="Enter a prompt and click Deploy to start." />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
