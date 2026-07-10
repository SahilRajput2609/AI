import { useState, useEffect } from 'react'
import {
  ClipboardList,
  GitBranch,
  Code,
  Search,
  Crown,
  Bot,
  Database,
  Globe,
  FileText,
  TestTube,
  Bug,
  Cloud,
} from 'lucide-react'
import { AgentCard } from './AgentCard'
import { api as apiClient } from '../../lib/api'
import { SkeletonCard } from '../ui/Skeleton'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  owner: Crown,
  planner: ClipboardList,
  orchestrator: GitBranch,
  coder: Code,
  reviewer: Search,
  frontend: Code,
  backend: Bot,
  api: Globe,
  database: Database,
  qa: TestTube,
  debugger: Bug,
  devops: Cloud,
  documentation: FileText,
}

export function AgentFlowCanvas() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .getAgents()
      .then(setAgents)
      .catch(() => {})
      .finally(() => setLoading(false))
    const interval = setInterval(() => {
      apiClient
        .getAgents()
        .then(setAgents)
        .catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const mainCards = agents.filter((a) => ['owner', 'planner', 'orchestrator', 'coder', 'reviewer'].includes(a.role))
  const displayCards = mainCards.length > 0 ? mainCards : []

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 gap-4 justify-items-center">
          {displayCards.length > 0 ? (
            displayCards.slice(0, 5).map((agent, i) => {
              const Icon = iconMap[agent.role]
              const statusMap: Record<string, 'online' | 'offline' | 'busy' | 'idle' | 'running'> = {
                running: 'running',
                online: 'online',
                idle: 'idle',
                offline: 'offline',
                busy: 'busy',
              }
              const mappedStatus = statusMap[agent.status] || 'idle'
              return (
                <div key={agent.id} className={i === 2 ? 'col-span-2' : ''}>
                  <AgentCard
                    title={agent.name || agent.role}
                    subtitle={agent.currentTask || agent.status || 'idle'}
                    icon={Icon}
                    status={mappedStatus}
                  />
                </div>
              )
            })
          ) : (
            <>
              <AgentCard title="Owner" subtitle="You are in control" icon={Crown} status="online" id="owner" />
              <AgentCard
                title="Planner"
                subtitle="Waiting for tasks"
                icon={ClipboardList}
                status="offline"
                id="planner"
              />
              <div className="col-span-2">
                <AgentCard
                  title="Orchestrator"
                  subtitle="Waiting for dispatch"
                  icon={GitBranch}
                  status="offline"
                  id="orchestrator"
                />
              </div>
              <AgentCard title="Coder" subtitle="Ready" icon={Code} status="offline" id="coder" />
              <AgentCard title="Reviewer" subtitle="Ready" icon={Search} status="offline" id="reviewer" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
