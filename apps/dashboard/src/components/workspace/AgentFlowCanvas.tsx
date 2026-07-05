import { ClipboardList, GitBranch, Code, Search } from 'lucide-react'
import { AgentCard } from './AgentCard'

const cards = [
  {
    id: 'owner',
    type: 'OwnerCard' as const,
    title: 'Owner',
    subtitle: 'You are in control',
    status: 'online' as const,
    accentColor: 'text-accent-warning',
    width: 280,
    actions: [
      { label: 'New Task', variant: 'primary' },
      { label: 'Assign', variant: 'ghost' },
    ],
  },
  {
    id: 'planner',
    type: 'AgentCard' as const,
    title: 'Planner',
    subtitle: '3 subtasks remaining',
    status: 'idle' as const,
    icon: ClipboardList,
    accentColor: 'text-accent-purple',
    width: 280,
    badge: 'Idle',
    metrics: [
      { label: 'Tasks', value: 8 },
      { label: 'Done', value: 5 },
    ],
  },
  {
    id: 'orchestrator',
    type: 'AgentCard' as const,
    title: 'Orchestrator',
    subtitle: 'Executing step 4 of 8',
    status: 'running' as const,
    icon: GitBranch,
    accentColor: 'text-accent-primary',
    width: 280,
    badge: 'Running',
    progressBar: { value: 50, color: 'primary' },
    currentAction: 'Running auth middleware pipeline',
  },
  {
    id: 'coder',
    type: 'AgentCard' as const,
    title: 'Coder',
    subtitle: 'Writing src/middleware/auth.ts',
    status: 'running' as const,
    icon: Code,
    accentColor: 'text-accent-primary',
    width: 280,
    badge: 'Writing',
    logs: [
      { level: 'info', message: '> Initializing task...' },
      { level: 'info', message: '> Reading spec.md' },
      { level: 'success', message: '> Generating types...' },
      { level: 'info', message: '> Writing implementation...' },
    ],
  },
  {
    id: 'reviewer',
    type: 'AgentCard' as const,
    title: 'Reviewer',
    subtitle: '1 pending review',
    status: 'online' as const,
    icon: Search,
    accentColor: 'text-accent-success',
    width: 280,
    badge: 'Online',
    metrics: [
      { label: 'Approved', value: 12 },
      { label: 'Changes', value: 3 },
    ],
  },
]

export function AgentFlowCanvas() {
  return (
    <div className="flex-1 p-6 bg-surface-bg overflow-auto">
      <div className="relative max-w-3xl mx-auto">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 800 600">
          <defs>
            <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="rgba(255,255,255,0.05)" />
            </pattern>
            <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cca374" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#cca374" />
            </linearGradient>
            <linearGradient id="flowGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cca374" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="flowGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#cca374" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
          
          {/* Animated Glowing Connection Lines between nodes */}
          {/* Owner -> Planner */}
          <path d="M 360 80 H 440" stroke="url(#flowGradient1)" strokeWidth="2" fill="none" className="flow-line" filter="url(#glow)" />
          {/* Planner -> Orchestrator */}
          <path d="M 580 140 v 25 C 580 205, 400 205, 400 235" stroke="url(#flowGradient2)" strokeWidth="2" fill="none" className="flow-line" filter="url(#glow)" />
          {/* Orchestrator -> Coder */}
          <path d="M 400 325 v 25 C 400 390, 220 380, 220 410" stroke="url(#flowGradient3)" strokeWidth="2" fill="none" className="flow-line" filter="url(#glow)" />
          {/* Coder -> Reviewer */}
          <path d="M 360 470 H 440" stroke="url(#flowGradient4)" strokeWidth="2" fill="none" className="flow-line" filter="url(#glow)" />
          {/* Reviewer -> Owner (Feedback loop) */}
          <path d="M 580 470 h 60 C 700 470, 700 80, 220 80" stroke="url(#flowGradient1)" strokeWidth="1.5" fill="none" className="flow-line" filter="url(#glow)" opacity="0.35" />
        </svg>

        <div className="relative z-10 grid grid-cols-2 gap-6 justify-items-center">
          <div className="col-start-1 col-end-2 row-start-1 row-end-2" style={{ animation: 'slide-up 300ms ease-out both' }}>
            <AgentCard {...cards[0]} />
          </div>
          <div className="col-start-2 col-end-3 row-start-1 row-end-2" style={{ animation: 'slide-up 300ms ease-out 80ms both' }}>
            <AgentCard {...cards[1]} />
          </div>
          <div className="col-start-1 col-end-3 row-start-2 row-end-3 justify-self-center" style={{ animation: 'slide-up 300ms ease-out 160ms both' }}>
            <AgentCard {...cards[2]} />
          </div>
          <div className="col-start-1 col-end-2 row-start-3 row-end-4" style={{ animation: 'slide-up 300ms ease-out 240ms both' }}>
            <AgentCard {...cards[3]} />
          </div>
          <div className="col-start-2 col-end-3 row-start-3 row-end-4" style={{ animation: 'slide-up 300ms ease-out 320ms both' }}>
            <AgentCard {...cards[4]} />
          </div>
        </div>
      </div>
    </div>
  )
}
