import { useState, useEffect } from 'react'
import { ArrowLeft, Terminal, Rocket, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { api } from '../lib/api'

interface DeploymentLogsProps {
  deploymentId: string
  onClose: () => void
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  ready: { icon: CheckCircle, color: 'text-[#22C55E]', label: 'Ready' },
  failed: { icon: XCircle, color: 'text-[#EF4444]', label: 'Failed' },
  pending: { icon: Clock, color: 'text-[#FACC15]', label: 'Pending' },
  building: { icon: Loader2, color: 'text-[#7C6BFF]', label: 'Building' },
}

export function DeploymentLogs({ deploymentId, onClose }: DeploymentLogsProps) {
  const [logs, setLogs] = useState<{ build_logs: string; status: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getDeploymentLogs(deploymentId)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [deploymentId])

  const config = logs?.status ? statusConfig[logs.status] || statusConfig.pending : statusConfig.pending
  const logLines = logs?.build_logs?.split('\n') || []

  return (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#202020] bg-[#0A0A0A] flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded text-[#6B7280] hover:text-white hover:bg-[#151515] transition-all"
        >
          <ArrowLeft size={15} />
        </button>
        <Terminal size={14} className="text-[#7C6BFF]" />
        <span className="text-sm font-medium text-white">Deployment Logs</span>
        {logs && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-current/10 ${config.color}`}>{config.label}</span>
        )}
      </div>

      {/* Log content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={16} className="text-[#7C6BFF] animate-spin" />
          </div>
        ) : (
          <div className="bg-[#080808] border border-[#202020] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#202020]">
              <Rocket size={12} className="text-[#6B7280]" />
              <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-medium">Build Output</span>
            </div>
            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {logLines.map((line, i) => {
                const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')
                const isWarn = line.toLowerCase().includes('warn') || line.toLowerCase().includes('warning')
                const isSuccess = line.toLowerCase().includes('success') || line.toLowerCase().includes('ready')
                return (
                  <div
                    key={i}
                    className={
                      isError
                        ? 'text-[#EF4444]'
                        : isWarn
                          ? 'text-[#FACC15]'
                          : isSuccess
                            ? 'text-[#22C55E]'
                            : 'text-[#A1A1AA]'
                    }
                  >
                    <span className="text-[#6B7280]">{String(i + 1).padStart(3, ' ')}</span>
                    {'  '}
                    {line}
                  </div>
                )
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
