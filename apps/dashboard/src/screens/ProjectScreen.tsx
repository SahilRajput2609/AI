import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Layout,
  Code2,
  Eye,
  File,
  MessageSquare,
  GitBranch,
  GitCompare,
  RotateCcw,
  Rocket,
  Settings,
  Globe,
  Terminal,
  Plus,
  Trash2,
  XCircle,
  Loader2,
  Send,
  ExternalLink,
} from 'lucide-react'
import { api } from '../lib/api'
import { useRealtime } from '../lib/realtime'
import { clsx } from '../components/utils/clsx'
import { CodeEditor } from '../components/CodeEditor'
import { VersionDiff } from '../components/VersionDiff'

type ProjectTab = 'overview' | 'preview' | 'code' | 'files' | 'chat' | 'versions' | 'deploy' | 'settings'

const tabs: { id: ProjectTab; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: Layout },
  { id: 'files', label: 'Files', icon: File },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'versions', label: 'Versions', icon: GitBranch },
  { id: 'deploy', label: 'Deploy', icon: Rocket },
  { id: 'settings', label: 'Settings', icon: Settings },
]

interface ProjectScreenProps {
  projectId: string
  onBack: () => void
}

export function ProjectScreen({ projectId, onBack }: ProjectScreenProps) {
  const [tab, setTab] = useState<ProjectTab>('overview')
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProject()
  }, [projectId])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'w') {
        e.preventDefault()
        onBack()
      }
      if (ctrl && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        window.location.href = '/'
      }
      if (e.altKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault()
        const idx = parseInt(e.key) - 1
        if (idx >= 0 && idx < tabs.length) {
          setTab(tabs[idx].id)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onBack])

  const loadProject = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getProject(projectId)
      setProject(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={20} className="text-[#7C6BFF] animate-spin" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <XCircle size={24} className="text-[#EF4444]" />
        <p className="text-sm text-[#EF4444]">{error || 'Project not found'}</p>
        <button onClick={onBack} className="text-xs text-[#7C6BFF] hover:underline">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#202020] bg-[#0A0A0A] flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-[#151515] transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#7C6BFF]/10 flex items-center justify-center">
          <Layout size={14} className="text-[#7C6BFF]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium text-white truncate">{project.name}</h1>
          {project.description && <p className="text-[11px] text-[#6B7280] truncate">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'text-[10px] px-2 py-0.5 rounded-full font-medium',
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
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-4 border-b border-[#202020] bg-[#0A0A0A] flex-shrink-0 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all flex-shrink-0',
                isActive
                  ? 'text-white border-[#7C6BFF]'
                  : 'text-[#6B7280] border-transparent hover:text-[#A1A1AA] hover:border-[#333]',
              )}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="h-full"
          >
            {tab === 'overview' && <OverviewTab project={project} />}
            {tab === 'preview' && <PreviewTab projectId={projectId} />}
            {tab === 'code' && <CodeTab projectId={projectId} />}
            {tab === 'files' && <FilesTab projectId={projectId} />}
            {tab === 'chat' && <ChatTab projectId={projectId} />}
            {tab === 'versions' && <VersionsTab projectId={projectId} />}
            {tab === 'deploy' && <DeployTab projectId={projectId} />}
            {tab === 'settings' && <SettingsTab project={project} onRefresh={loadProject} onBack={onBack} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Overview Tab ─── */
function OverviewTab({ project }: { project: any }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProjectStats(project.id)
        setStats(data)
      } catch {}
    }
    load()
  }, [project.id])

  const statCards = [
    { label: 'Files', value: stats?.fileCount ?? '—', icon: File },
    { label: 'Lines of Code', value: stats?.lineCount ?? '—', icon: Code2 },
    { label: 'Versions', value: stats?.versionCount ?? '—', icon: GitBranch },
    { label: 'Deployments', value: stats?.deploymentCount ?? '—', icon: Rocket },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Project Info */}
      <div className="bg-[#0F0F0F] border border-[#202020] rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white mb-3">Project Info</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          {[
            ['Name', project.name],
            ['Type', project.type || 'Custom'],
            ['Model', project.model || 'Default'],
            ['Framework', project.framework || '—'],
            ['Created', new Date(project.created_at).toLocaleDateString()],
            ['Updated', new Date(project.updated_at).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[#6B7280] mb-0.5">{label}</p>
              <p className="text-white font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-[#0F0F0F] border border-[#202020] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon size={14} className="text-[#6B7280]" />
            </div>
            <p className="text-lg font-semibold text-white">{s.value}</p>
            <p className="text-[11px] text-[#6B7280]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-[#0F0F0F] border border-[#202020] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-2">Description</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">{project.description}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Preview Tab ─── */
function PreviewTab({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { lastFileSaved } = useRealtime()

  useEffect(() => {
    if (lastFileSaved && lastFileSaved.projectId === projectId) {
      setRefreshKey((k) => k + 1)
    }
  }, [lastFileSaved, projectId])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const html = await buildPreviewHtml(projectId)
        if (html) {
          if (previewUrl) URL.revokeObjectURL(previewUrl)
          const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
          setPreviewUrl(url)
        } else {
          setPreviewUrl(null)
          setError('No preview available')
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load preview')
      }
      setLoading(false)
    }
    load()
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [projectId, refreshKey])

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#202020] bg-[#0A0A0A] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Globe size={13} className="text-[#6B7280]" />
          <span className="text-xs text-[#6B7280]">Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-2 py-1 rounded-md text-[10px] text-[#6B7280] hover:text-white hover:bg-[#151515] transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={16} className="text-[#7C6BFF] animate-spin" />
        </div>
      ) : previewUrl ? (
        <iframe
          key={refreshKey}
          src={previewUrl}
          className="w-full flex-1 bg-white"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#6B7280]">
          <Globe size={32} />
          <p className="text-sm">{error || 'No preview available'}</p>
          <p className="text-xs">Add an index.html file to see a live preview</p>
        </div>
      )}
    </div>
  )
}

async function buildPreviewHtml(projectId: string): Promise<string | null> {
  try {
    const tree = await api.getProjectFiles(projectId)
    const allFiles = flattenTree(tree.files || tree.tree || [])

    const indexFile = allFiles.find((f) => f.name === 'index.html' || f.path?.endsWith('/index.html'))
    if (!indexFile) {
      // Generate a default preview
      const cssFiles = allFiles.filter((f) => f.name.endsWith('.css'))
      const jsFiles = allFiles.filter((f) => f.name.endsWith('.js'))
      return buildDefaultPreview(cssFiles, jsFiles)
    }

    const content = await api.readProjectFile(projectId, indexFile.path)
    return content.content
  } catch {
    return null
  }
}

function flattenTree(files: any[]): any[] {
  const result: any[] = []
  for (const f of files) {
    result.push(f)
    if (f.children) result.push(...flattenTree(f.children))
  }
  return result
}

function buildDefaultPreview(cssFiles: any[], jsFiles: any[]): string {
  const cssLinks = cssFiles.map((f) => `<link rel="stylesheet" href="${f.path || f.name}">`).join('\n  ')
  const jsScripts = jsFiles.map((f) => `<script src="${f.path || f.name}"></script>`).join('\n  ')
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${cssLinks}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #333; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .preview-empty { text-align: center; }
    .preview-empty h2 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #111; }
    .preview-empty p { color: #666; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="preview-empty">
    <h2>Project Preview</h2>
    <p>${cssFiles.length + jsFiles.length} asset files found. Create an index.html to see a live preview.</p>
  </div>
  ${jsScripts}
</body>
</html>`
}

/* ─── Code Tab ─── */
function CodeTab({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getProjectFiles(projectId)
      .then((data) => setFiles(data.files || data.tree || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-4 w-4 text-[#7C6BFF]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return <CodeEditor projectId={projectId} files={files} />
}

/* ─── Files Tab ─── */
function FilesTab({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProjectFiles(projectId)
        setFiles(data.files || data.tree || [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [projectId])

  useEffect(() => {
    if (selectedFile) {
      api
        .readProjectFile(projectId, selectedFile.path)
        .then((r) => setFileContent(r.content))
        .catch(() => setFileContent('// Error loading file'))
    }
  }, [selectedFile, projectId])

  const folders = files.filter((f: any) => f.type !== 'file')
  const fileItems = files.filter((f: any) => f.type === 'file')

  return (
    <div className="flex h-full">
      <div className="w-60 border-r border-[#202020] bg-[#0A0A0A] overflow-y-auto flex-shrink-0 p-2">
        <p className="text-[10px] text-[#6B7280] uppercase tracking-wider px-2 mb-2 font-medium">Project Files</p>
        {loading ? (
          <div className="space-y-1 px-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-[#151515] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {folders.map((f: any) => (
              <div key={f.path} className="flex items-center gap-2 px-2 py-1 text-xs text-[#A1A1AA]">
                <span className="text-[#7C6BFF]">📁</span> {f.name}
              </div>
            ))}
            {fileItems.map((f: any) => (
              <button
                key={f.path}
                onClick={() => setSelectedFile(f)}
                className={clsx(
                  'w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors',
                  selectedFile?.path === f.path
                    ? 'bg-[#7C6BFF]/10 text-white'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#151515]',
                )}
              >
                <File size={12} />
                <span className="truncate">{f.name}</span>
                <span className="ml-auto text-[10px] text-[#6B7280]">{f.size || ''}</span>
              </button>
            ))}
            {files.length === 0 && <p className="text-[10px] text-[#6B7280] px-2">No files yet</p>}
          </>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {selectedFile ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">{selectedFile.name}</h3>
              <span className="text-[10px] text-[#6B7280]">{selectedFile.path}</span>
            </div>
            <pre className="text-xs text-[#A1A1AA] font-mono bg-[#080808] rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {fileContent}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-[#6B7280]">
            Select a file to view its content
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Chat Tab ─── */
function ChatTab({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getChatMessages(projectId)
        setMessages(data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    setMessages((prev) => [
      ...prev,
      { id: 'temp-' + Date.now(), role: 'user', content: text, created_at: new Date().toISOString() },
    ])
    try {
      const response = await api.sendChatMessage(text, projectId)
      setMessages((prev) => [...prev, response.message || response])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: 'Sorry, something went wrong.',
          created_at: new Date().toISOString(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={16} className="text-[#7C6BFF] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare size={24} className="text-[#6B7280] mb-2" />
            <p className="text-sm text-[#6B7280]">Chat with AI about this project</p>
            <p className="text-xs text-[#6B7280] mt-1">Ask to add features, fix bugs, or refactor code</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#7C6BFF] text-white rounded-br-md'
                    : 'bg-[#151515] text-[#D4D4D8] rounded-bl-md border border-[#202020]',
                )}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 border-t border-[#202020] p-3 bg-[#0A0A0A]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask the AI to help with this project..."
            className="flex-1 bg-[#0F0F0F] border border-[#202020] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6B7280] outline-none focus:border-[#7C6BFF]/40 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2 rounded-xl bg-[#7C6BFF] text-white hover:bg-[#6A5BEF] disabled:opacity-30 transition-all"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Versions Tab ─── */
function VersionsTab({ projectId }: { projectId: string }) {
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  const load = async () => {
    try {
      const data = await api.getVersions(projectId)
      setVersions(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [projectId])

  const handleCreate = async () => {
    setCreating(true)
    try {
      await api.createVersion(projectId)
      await load()
    } catch {}
    setCreating(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteVersion(id)
      await load()
    } catch {}
  }

  const handleRestore = async (id: string) => {
    setRestoring(id)
    try {
      await api.restoreVersion(id)
      await load()
    } catch {}
    setRestoring(null)
  }

  if (showDiff) {
    return <VersionDiff projectId={projectId} onClose={() => setShowDiff(false)} />
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Version History</h3>
        <div className="flex items-center gap-2">
          {versions.length >= 2 && (
            <button
              onClick={() => setShowDiff(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202020] text-[#A1A1AA] text-xs font-medium hover:text-white hover:bg-[#151515] transition-all"
            >
              <GitCompare size={12} />
              Compare
            </button>
          )}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C6BFF] text-white text-xs font-medium hover:bg-[#6A5BEF] disabled:opacity-50 transition-all"
          >
            {creating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Snapshot
          </button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#151515] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-[#6B7280]">
          <GitBranch size={24} className="mx-auto mb-2" />
          <p className="text-sm">No versions yet</p>
          <p className="text-xs mt-1">Take a snapshot of your project to save this state</p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between bg-[#0F0F0F] border border-[#202020] rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#7C6BFF]/10 flex items-center justify-center">
                  <GitBranch size={14} className="text-[#7C6BFF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-white">{v.title || `v${v.version_number}`}</p>
                    <span className="text-[10px] text-[#6B7280] bg-[#151515] px-1.5 py-0.5 rounded">
                      {v.file_count || 0} files
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">
                    {new Date(v.created_at).toLocaleString()}
                    {v.description && ` · ${v.description}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRestore(v.id)}
                  disabled={restoring === v.id}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#22C55E] hover:bg-[#22C55E]/5 transition-all"
                  title="Restore this version"
                >
                  {restoring === v.id ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all"
                  title="Delete version"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Deploy Tab ─── */
function DeployTab({ projectId }: { projectId: string }) {
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [platform, setPlatform] = useState('vercel')
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await api.getDeployments(projectId)
      setDeployments(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [projectId])

  const handleDeploy = async () => {
    setDeploying(true)
    let deployId: string | null = null
    try {
      const deploy = await api.createDeployment(projectId, platform)
      deployId = deploy.id
      // Poll until status is ready or failed
      const poll = setInterval(async () => {
        try {
          const updated = await api.getDeployment(deployId!)
          if (updated.status === 'ready' || updated.status === 'failed') {
            clearInterval(poll)
            await load()
            setDeploying(false)
          }
        } catch {
          clearInterval(poll)
          await load()
          setDeploying(false)
        }
      }, 2000)
      // Safety timeout after 60 seconds
      setTimeout(() => {
        clearInterval(poll)
        load()
        setDeploying(false)
      }, 60000)
    } catch {
      await load()
      setDeploying(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Deploy form */}
      <div className="bg-[#0F0F0F] border border-[#202020] rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Deploy Project</h3>
        <div className="flex items-center gap-3 mb-4">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-[#080808] border border-[#202020] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#7C6BFF]/40"
          >
            <option value="vercel">Vercel</option>
            <option value="netlify">Netlify</option>
            <option value="aws">AWS</option>
          </select>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 disabled:opacity-50 transition-all"
          >
            {deploying ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />}
            {deploying ? 'Deploying...' : 'Deploy'}
          </button>
        </div>
      </div>

      {/* Deployment history */}
      <h4 className="text-xs font-medium text-[#A1A1AA] mb-3">Deployment History</h4>
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-[#151515] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <div className="text-center py-8 text-[#6B7280]">
          <Rocket size={20} className="mx-auto mb-2" />
          <p className="text-xs">No deployments yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {deployments.map((d) => (
            <div key={d.id}>
              <button
                onClick={() => setExpandedLogs(expandedLogs === d.id ? null : d.id)}
                className="w-full flex items-center justify-between bg-[#0F0F0F] border border-[#202020] rounded-xl p-3 hover:border-[#333] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      d.status === 'ready'
                        ? 'bg-[#22C55E]'
                        : d.status === 'building' || d.status === 'pending'
                          ? 'bg-[#FACC15]'
                          : d.status === 'failed'
                            ? 'bg-[#EF4444]'
                            : 'bg-[#6B7280]',
                    )}
                  />
                  <div>
                    <p className="text-xs text-white font-medium">{d.platform || platform}</p>
                    <p className="text-[10px] text-[#6B7280]">{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      d.status === 'ready'
                        ? 'bg-[#22C55E]/10 text-[#22C55E]'
                        : d.status === 'building' || d.status === 'pending'
                          ? 'bg-[#FACC15]/10 text-[#FACC15]'
                          : d.status === 'failed'
                            ? 'bg-[#EF4444]/10 text-[#EF4444]'
                            : 'bg-[#6B7280]/10 text-[#6B7280]',
                    )}
                  >
                    {d.status}
                  </span>
                  {d.url && (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded text-[#6B7280] hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </button>
              {expandedLogs === d.id && <DeploymentLogsInline deploymentId={d.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Deployment Logs Inline ─── */
function DeploymentLogsInline({ deploymentId }: { deploymentId: string }) {
  const [logs, setLogs] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getDeploymentLogs(deploymentId)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [deploymentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 bg-[#080808] border-x border-b border-[#202020] rounded-b-xl">
        <Loader2 size={12} className="text-[#7C6BFF] animate-spin" />
      </div>
    )
  }

  const logLines = logs?.build_logs?.split('\n') || []

  return (
    <div className="bg-[#080808] border-x border-b border-[#202020] rounded-b-xl p-3">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#202020]">
        <Terminal size={11} className="text-[#6B7280]" />
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-medium">Build Logs</span>
      </div>
      <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
        {logLines.length > 0 ? (
          logLines.map((line: string, i: number) => {
            const isError = /error|failed/i.test(line)
            const isWarn = /warn(ing)?/i.test(line)
            const isSuccess = /success|ready|built/i.test(line)
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
          })
        ) : (
          <div className="text-[#6B7280]">No logs available</div>
        )}
      </pre>
    </div>
  )
}

/* ─── Settings Tab ─── */
function SettingsTab({ project, onRefresh, onBack }: { project: any; onRefresh: () => void; onBack: () => void }) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateProject(project.id, { name, description })
      onRefresh()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this project permanently?')) return
    setDeleting(true)
    try {
      await api.deleteProject(project.id)
      onBack()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="bg-[#0F0F0F] border border-[#202020] rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">Project Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#6B7280] block mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080808] border border-[#202020] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#7C6BFF]/40"
            />
          </div>
          <div>
            <label className="text-xs text-[#6B7280] block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#080808] border border-[#202020] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#7C6BFF]/40 resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 disabled:opacity-50 transition-all"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-[#0F0F0F] border border-[#EF4444]/20 rounded-2xl p-5">
        <h3 className="text-sm font-medium text-[#EF4444] mb-2">Danger Zone</h3>
        <p className="text-xs text-[#6B7280] mb-3">Permanently delete this project and all its files.</p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium hover:bg-[#EF4444]/20 disabled:opacity-50 transition-all"
        >
          {deleting ? 'Deleting...' : 'Delete Project'}
        </button>
      </div>
    </div>
  )
}

/* ─── Helpers ─── */
