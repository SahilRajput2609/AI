import { useState } from 'react'
import { Minimize2, Maximize2, Paperclip, Send, Mic } from 'lucide-react'
import { clsx } from '../utils/clsx'
import { Avatar } from '../ui/Avatar'

interface Message {
  role: 'user' | 'assistant'
  avatar: string
  text: string
  timestamp: string
  codeSnippet?: { language: string; content: string }
}

const messages: Message[] = [
  {
    role: 'user',
    avatar: 'JD',
    text: 'Add authentication middleware with JWT validation',
    timestamp: '2m ago',
  },
  {
    role: 'assistant',
    avatar: 'AI',
    text: "I'll create an auth guard that validates JWTs. Let me check the existing middleware structure first.",
    timestamp: '1m ago',
  },
  {
    role: 'assistant',
    avatar: 'AI',
    text: 'Found src/middleware/ directory. Creating auth.ts with:\n- JWT verification\n- Role-based access control\n- Error handling middleware',
    timestamp: '30s ago',
    codeSnippet: {
      language: 'typescript',
      content: 'export async function authGuard(\n  req: Request,\n  res: Response,\n  next: NextFunction\n): Promise<void> {',
    },
  },
]

const suggestions = ['What changed in auth?', 'Run tests', 'Deploy preview']

export function ChatPanel() {
  const [input, setInput] = useState('')

  return (
    <div className="w-[320px] flex-shrink-0 bg-surface-sidebar/60 border-l border-white/5 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Chat</h3>
          <p className="text-[11px] text-text-muted">Codebase Context</p>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 cursor-pointer transition-colors">
            <Minimize2 size={14} />
          </button>
          <button className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 cursor-pointer transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ scrollBehavior: 'smooth' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              'flex gap-2 animate-slide-up will-change-transform',
              msg.role === 'user' ? 'justify-end' : 'justify-start',
            )}
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
          >
            {msg.role === 'assistant' && (
              <Avatar fallback="AI" size={28} border="2px solid rgba(139,92,246,0.3)" />
            )}
            <div
              className={clsx(
                'max-w-[85%] p-2.5',
                msg.role === 'user'
                  ? 'bg-accent-primary-subtle rounded-[12px_12px_4px_12px]'
                  : 'bg-surface-input rounded-[12px_12px_12px_4px]',
              )}
            >
              <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.text}</p>
              {msg.codeSnippet && (
                <div className="mt-2 bg-surface-terminal rounded-[8px] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-white/5">
                    <span className="text-[11px] text-text-muted font-mono">{msg.codeSnippet.language}</span>
                    <div className="flex gap-2">
                      <button className="text-[11px] text-text-muted hover:text-text-primary cursor-pointer transition-colors">Copy</button>
                      <button className="text-[11px] text-text-muted hover:text-text-primary cursor-pointer transition-colors">Apply</button>
                    </div>
                  </div>
                  <pre className="p-3 text-xs text-text-secondary font-mono overflow-x-auto">
                    <code>{msg.codeSnippet.content}</code>
                  </pre>
                </div>
              )}
              <span className="text-[11px] text-text-muted mt-1 block">{msg.timestamp}</span>
            </div>
            {msg.role === 'user' && <Avatar fallback="JD" size={28} />}
          </div>
        ))}
      </div>

      <div className="p-3 flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((s) => (
            <button
              key={s}
              className="text-xs text-text-secondary bg-surface-input/50 border border-white/5 rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-surface-input hover:text-text-primary cursor-pointer transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-surface-input border border-white/10 rounded-[12px] px-4 py-3 focus-within:border-accent-primary/30 transition-colors">
          <button className="text-text-muted hover:text-text-primary cursor-pointer transition-colors flex-shrink-0">
            <Paperclip size={16} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your codebase..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
          />
          <button className="text-text-muted hover:text-text-primary cursor-pointer transition-colors flex-shrink-0">
            <Mic size={16} />
          </button>
          <button className="text-accent-primary hover:text-accent-primary-hover cursor-pointer transition-colors flex-shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
