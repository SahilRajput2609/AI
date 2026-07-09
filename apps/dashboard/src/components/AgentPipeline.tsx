import { motion } from 'framer-motion'
import { CheckCircle, Loader2, XCircle, Clock } from 'lucide-react'

export interface AgentStep {
  id: string
  name: string
  icon: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: string
  logs?: string[]
}

interface AgentPipelineProps {
  steps: AgentStep[]
  isRunning: boolean
}

const agentIcons: Record<string, string> = {
  'Planner': '📋',
  'UI Designer': '🎨',
  'Frontend Developer': '💻',
  'Backend Developer': '⚙️',
  'Database Engineer': '🗄️',
  'DevOps Engineer': '🚀',
  'QA Engineer': '🧪',
  'Code Reviewer': '🔍',
}

export function AgentPipeline({ steps, isRunning }: AgentPipelineProps) {
  return (
    <div className="bg-[#0F0F0F] border border-[#202020] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">AI Agent Pipeline</h3>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-[11px] text-[#7C6BFF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C6BFF] animate-pulse" />
            Processing
          </span>
        )}
      </div>

      <div className="space-y-1">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              step.status === 'running'
                ? 'bg-[#7C6BFF]/5 border border-[#7C6BFF]/20'
                : step.status === 'completed'
                ? 'bg-[#22C55E]/5 border border-[#22C55E]/10'
                : step.status === 'failed'
                ? 'bg-[#EF4444]/5 border border-[#EF4444]/10'
                : 'bg-transparent border border-transparent'
            }`}
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`absolute left-[22px] top-10 w-[1px] h-[calc(100%+4px)] ${
                step.status === 'completed' ? 'bg-[#22C55E]/30' : 'bg-[#202020]'
              }`} />
            )}

            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
              step.status === 'completed'
                ? 'bg-[#22C55E]/10'
                : step.status === 'failed'
                ? 'bg-[#EF4444]/10'
                : step.status === 'running'
                ? 'bg-[#7C6BFF]/10'
                : 'bg-[#151515]'
            }`}>
              {step.status === 'completed' ? (
                <CheckCircle size={16} className="text-[#22C55E]" />
              ) : step.status === 'failed' ? (
                <XCircle size={16} className="text-[#EF4444]" />
              ) : step.status === 'running' ? (
                <Loader2 size={14} className="text-[#7C6BFF] animate-spin" />
              ) : (
                <span className="text-sm">{step.icon || agentIcons[step.name] || '⚡'}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${
                  step.status === 'completed' ? 'text-[#22C55E]'
                    : step.status === 'failed' ? 'text-[#EF4444]'
                    : step.status === 'running' ? 'text-[#7C6BFF]'
                    : 'text-[#A1A1AA]'
                }`}>
                  {step.name}
                </p>
                {step.duration && (
                  <span className="text-[10px] text-[#6B7280]">{step.duration}</span>
                )}
              </div>
              {step.logs && step.logs.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {step.logs.slice(-3).map((log, j) => (
                    <p key={j} className="text-[10px] text-[#6B7280] font-mono leading-tight">{log}</p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {steps.length === 0 && (
        <div className="text-center py-8">
          <Clock size={24} className="text-[#6B7280] mx-auto mb-2" />
          <p className="text-xs text-[#6B7280]">No active pipeline. Describe your project to start.</p>
        </div>
      )}
    </div>
  )
}
