import { useState, useEffect, useRef } from "react";
import { 
  Play, RotateCcw, Check,
  Cpu, Code2, Terminal as TerminalIcon
} from "lucide-react";
import { clsx } from "../components/utils/clsx";
import { api } from "../lib/api";

export function AgentIdeScreen() {
  const [prompt, setPrompt] = useState("");
  const [agents, setAgents] = useState<any[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<('queued' | 'running' | 'success' | 'failed')[]>([]);
  const [tasks, setTasks] = useState<{ description: string; assignedRole: string }[]>([]);
  
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  async function fetchAgents() {
    try {
      const data = await api.getAgents()
      setAgents(data)
    } catch {}
  }

  async function startDeployment() {
    if (isRunning || !prompt) return

    setIsRunning(true)
    setCurrentStep(1)
    setTerminalLogs([
      `[SYSTEM] Connecting to AI Agency Workgroup...`,
      `[SYSTEM] Connected. Creating task: "${prompt}"`,
      `[OWNER] Submitting task to Planner...`,
    ])

    try {
      const task = await api.createTask({ title: prompt, description: prompt, priority: 'medium', category: 'general' })
      setTerminalLogs(prev => [...prev, `[OWNER] Task created: ${task.id}`])

      const plan = await api.createPlan(task.id, prompt)
      setTerminalLogs(prev => [...prev, `[PLANNER] Execution plan created: ${plan.id}`])

      const subtasks = (plan as any).subTasks || (plan as any).subtasks || []
      if (subtasks.length > 0) {
        setTasks(subtasks.map((s: any) => ({ description: s.description, assignedRole: s.assignedRole })))
        setTaskStatuses(subtasks.map(() => 'queued' as const))
      }

      setTerminalLogs(prev => [...prev, `[SYSTEM] Dispatching to agents...`])
      const dispatchState = await api.triggerDispatch()

      setTerminalLogs(prev => [...prev, `[SYSTEM] Dispatched ${dispatchState.queued?.length || 0} tasks to agents`])
      setCurrentStep(8)
      setTaskStatuses(prev => prev.map(() => 'success' as const))
    } catch (err: any) {
      const message = err && typeof err.message === 'string' ? err.message : 'Unknown error'
      setTerminalLogs(prev => [...prev, `[SYSTEM] Error: ${message}`])
      setCurrentStep(0)
    }

    setIsRunning(false)
  }

  const resetIDE = () => {
    setIsRunning(false)
    setCurrentStep(0)
    setTerminalLogs([])
    setPrompt("")
    setTasks([])
    setTaskStatuses([])
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-black text-text-primary">
      
      {/* LEFT COLUMN: Prompt Input & Status */}
      <div className="w-[360px] flex-shrink-0 border-r border-white/5 flex flex-col bg-zinc-950/20">
        
        {/* Header Title */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <Cpu className="text-[#cca374]" size={16} />
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono">Agency Prompt Console</h2>
            <p className="text-[10px] text-text-muted">Broadcast tasks to sub-agent networks</p>
          </div>
        </div>

        {/* Action Prompt Panel */}
        <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-5">
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3.5 focus-within:border-[#cca374]/30 focus-within:bg-zinc-900/80 transition-colors">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">
                Project Definition Instruction
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isRunning}
                placeholder="Type instructions to delegate to agents (e.g. Build authorization guard)..."
                className="w-full h-24 bg-transparent text-xs text-white placeholder-zinc-600 outline-none resize-none"
              />
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                <span className="text-[10px] text-zinc-600 font-mono">{agents.length} agents available</span>
                <button
                  onClick={startDeployment}
                  disabled={isRunning || !prompt}
                  className="bg-[#cca374] text-black text-[11px] font-semibold px-3 py-1.5 rounded-md hover:bg-[#e2cca8] disabled:opacity-30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={11} />
                  <span>Deploy</span>
                </button>
              </div>
            </div>

            {/* Agent list */}
            {!isRunning && agents.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                  Available Agents ({agents.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agents.map((a: any) => (
                    <span key={a.id || a.role} className="text-[10px] text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-1 rounded font-mono">
                      {a.name || a.role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Task Status */}
            {isRunning && tasks.length > 0 && (
              <div className="space-y-3.5 pt-2 animate-fade-in">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                  Task Progress
                </p>
                <div className="relative border-l border-white/5 pl-4 space-y-4 ml-1">
                  {tasks.map((task, idx) => {
                    const status = taskStatuses[idx] || 'queued'
                    return (
                      <div key={idx} className="relative">
                        <div className={clsx(
                          "absolute -left-[20.5px] top-0.5 w-3 h-3 rounded-full border border-black flex items-center justify-center",
                          status === 'success' && "bg-emerald-500",
                          status === 'running' && "bg-[#cca374] animate-pulse",
                          status === 'failed' && "bg-red-500",
                          status === 'queued' && "bg-zinc-800"
                        )}>
                          {status === 'success' && <Check size={7} className="text-black font-bold" />}
                        </div>
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono font-semibold text-zinc-400">
                              {task.assignedRole} Agent
                            </span>
                            <span className={clsx(
                              "text-[8px] font-mono px-1 rounded uppercase tracking-wider font-semibold",
                              status === 'success' && "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10",
                              status === 'running' && "text-[#cca374] bg-[#cca374]/5 border border-[#cca374]/10",
                              status === 'queued' && "text-zinc-600",
                              status === 'failed' && "text-red-400 bg-red-500/5 border border-red-500/10"
                            )}>
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-white mt-0.5 leading-tight">{task.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {isRunning && (
            <button
              onClick={resetIDE}
              className="mt-6 flex items-center justify-center gap-1 text-zinc-500 hover:text-white border border-white/5 py-2.5 rounded-lg text-xs hover:bg-white/5 transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset Console
            </button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Output */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <div className="h-10 shrink-0 border-b border-white/5 bg-zinc-950/40 flex items-center px-4">
          <span className="text-xs text-zinc-500 font-mono">
            {currentStep > 0 ? 'Deployment Active' : 'Ready'}
          </span>
        </div>

        {/* Empty state */}
        {currentStep === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-zinc-950/25">
            <Code2 size={28} className="text-zinc-800 mb-2.5" />
            <p className="text-xs text-zinc-500 max-w-xs font-sans leading-relaxed">
              Type instructions in the prompt console and click <b>Deploy</b> to dispatch tasks to agents via the API.
            </p>
          </div>
        )}

        {/* Terminal Console */}
        <div className="flex-1 border-t border-white/5 bg-[#050505] flex flex-col">
          <div className="h-7 shrink-0 bg-zinc-950/60 border-b border-white/5 flex items-center px-4">
            <TerminalIcon size={12} className="text-[#cca374]" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-zinc-500 ml-2">Output Stream</span>
            {isRunning && (
              <span className="ml-auto flex items-center gap-1.5 text-[9px] text-[#cca374] font-mono animate-pulse">
                <span className="w-1.5 h-1.5 bg-[#cca374] rounded-full" />
                Processing
              </span>
            )}
          </div>
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-zinc-400 space-y-1 select-text scrollbar-thin">
            {terminalLogs.length > 0 ? (
              terminalLogs.map((log, i) => {
                let colorClass = "text-zinc-400";
                if (log.includes("[CODER]")) colorClass = "text-[#cca374]";
                if (log.includes("[PLANNER]")) colorClass = "text-violet-400";
                if (log.includes("[QA]")) colorClass = "text-cyan-400";
                if (log.includes("[SYSTEM]")) colorClass = "text-zinc-600";
                if (log.includes("[OWNER]")) colorClass = "text-amber-500 font-semibold";
                if (log.includes("[REVIEWER]")) colorClass = "text-blue-400";
                return <div key={i} className={clsx("leading-relaxed", colorClass)}>{log}</div>;
              })
            ) : (
              <div className="text-zinc-600">Terminal offline. Awaiting deployment pipeline initiation.</div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}


