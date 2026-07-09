import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor, { type OnMount } from '@monaco-editor/react'
import {
  X, Save, Folder, FileCode, FileJson, FileImage, FileText, File,
  ChevronRight, ChevronDown, Upload,
} from 'lucide-react'
import { clsx } from '../components/utils/clsx'
import { api } from '../lib/api'

interface EditorTab {
  path: string
  name: string
  content: string
  originalContent: string
  language: string
}

interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileNode[]
}

interface CodeEditorProps {
  projectId: string
  files: FileNode[]
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    json: 'json', html: 'html', css: 'css', scss: 'scss', less: 'less',
    md: 'markdown', py: 'python', rb: 'ruby', java: 'java', go: 'go',
    rs: 'rust', cpp: 'cpp', c: 'c', h: 'c', hpp: 'cpp',
    sql: 'sql', sh: 'shell', bash: 'shell', yml: 'yaml', yaml: 'yaml',
    xml: 'xml', svg: 'xml', txt: 'plaintext', env: 'plaintext',
  }
  return map[ext || ''] || 'plaintext'
}

export function CodeEditor({ projectId, files }: CodeEditorProps) {
  const [tabs, setTabs] = useState<EditorTab[]>([])
  const [activePath, setActivePath] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  const buildTree = useCallback((flatFiles: FileNode[]): FileNode[] => {
    const root: FileNode[] = []
    const map: Record<string, FileNode> = {}
    for (const f of flatFiles) {
      const parts = f.path.split('/')
      let current = root
      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1
        const path = parts.slice(0, i + 1).join('/')
        if (!map[path]) {
          const node: FileNode = {
            name: parts[i], path,
            type: isLast ? f.type : 'folder',
            children: isLast ? undefined : [],
          }
          map[path] = node; current.push(node)
        }
        if (!isLast) {
          const parent = map[path]
          if (!parent.children) parent.children = []
          current = parent.children
        }
      }
    }
    return root
  }, [])

  const fileTree = useMemo(() => buildTree(files), [files, buildTree])

  const activeTab = tabs.find(t => t.path === activePath)
  const isModified = activeTab && activeTab.content !== activeTab.originalContent

  const openFile = async (path: string, name: string) => {
    const existing = tabs.find(t => t.path === path)
    if (existing) { setActivePath(path); return }

    try {
      const res = await api.readProjectFile(projectId, path)
      const tab: EditorTab = {
        path, name, content: res.content,
        originalContent: res.content, language: getLanguage(name),
      }
      setTabs(prev => [...prev, tab])
      setActivePath(path)
    } catch {}
  }

  const closeTab = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setTabs(prev => prev.filter(t => t.path !== path))
    if (activePath === path) {
      const remaining = tabs.filter(t => t.path !== path)
      setActivePath(remaining.length > 0 ? remaining[remaining.length - 1].path : null)
    }
  }

  const handleContentChange = (value: string | undefined) => {
    if (!activePath || value === undefined) return
    setTabs(prev => prev.map(t => t.path === activePath ? { ...t, content: value } : t))
  }

  const handleSave = async () => {
    if (!activePath || !isModified) return
    setSaving(prev => ({ ...prev, [activePath]: true }))
    try {
      await api.writeProjectFile(projectId, activePath, activeTab!.content)
      setTabs(prev => prev.map(t => t.path === activePath ? { ...t, originalContent: t.content } : t))
    } catch {}
    setSaving(prev => ({ ...prev, [activePath]: false }))
  }

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => handleSave())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        const content = await file.text()
        await api.writeProjectFile(projectId, file.name, content)
      }
    } catch {}
    setUploading(false)
  }

  const handleContextMenu = (path: string, action: 'rename' | 'delete') => {
    console.log('Context menu:', path, action)
  }

  return (
    <div className="flex h-full bg-[#000000]">
      {/* File sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-[#202020] bg-[#0A0A0A] overflow-y-auto flex-shrink-0 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-2">
              <p className="text-[10px] text-[#6B7280] uppercase tracking-wider px-2 mb-2 font-medium">Explorer</p>
              {fileTree.length === 0 && (
                <p className="text-[10px] text-[#6B7280] px-2">No files</p>
              )}
              {fileTree.map(node => (
                <TreeNode
                  key={node.path}
                  node={node}
                  activePath={activePath}
                  onSelect={(path, name) => openFile(path, name)}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
            {dragOver && (
              <div className="absolute inset-0 bg-[#7C6BFF]/10 border-2 border-dashed border-[#7C6BFF] rounded-lg flex items-center justify-center z-10">
                <div className="text-center">
                  <Upload size={24} className="text-[#7C6BFF] mx-auto mb-1" />
                  <p className="text-xs text-[#7C6BFF] font-medium">Drop files to upload</p>
                </div>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-[#000000]/60 flex items-center justify-center z-10">
                <svg className="animate-spin h-5 w-5 text-[#7C6BFF]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs bar */}
        {tabs.length > 0 && (
          <div className="flex items-center border-b border-[#202020] bg-[#0A0A0A] overflow-x-auto flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-2 py-2 text-[#6B7280] hover:text-white border-r border-[#202020]"
            >
              {sidebarOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {tabs.map(tab => {
              const modified = tab.content !== tab.originalContent
              return (
                <button
                  key={tab.path}
                  onClick={() => setActivePath(tab.path)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 text-xs border-r border-[#202020] transition-colors flex-shrink-0 max-w-[160px] group',
                    activePath === tab.path ? 'bg-[#151515] text-white border-b border-b-[#7C6BFF]' : 'text-[#6B7280] hover:text-[#A1A1AA] hover:bg-[#0F0F0F]',
                  )}
                >
                  {modified && <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] flex-shrink-0" />}
                  <span className="truncate">{tab.name}</span>
                  <span
                    onClick={(e) => closeTab(tab.path, e)}
                    className="ml-auto p-0.5 rounded text-[#6B7280] hover:text-white hover:bg-[#202020] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <X size={11} />
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {activePath && activeTab ? (
          <>
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#202020] bg-[#0A0A0A] flex-shrink-0">
              <span className="text-[10px] text-[#6B7280] font-mono truncate">{activePath}</span>
              <div className="flex items-center gap-2">
                {isModified && <span className="text-[10px] text-[#FACC15]">Unsaved</span>}
                <button
                  onClick={handleSave}
                  disabled={!isModified || saving[activePath]}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
                    isModified
                      ? 'bg-[#7C6BFF] text-white hover:bg-[#6A5BEF]'
                      : 'bg-[#151515] text-[#6B7280] cursor-not-allowed',
                  )}
                >
                  {saving[activePath] ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Save size={12} />
                  )}
                  {isModified ? 'Save' : 'Saved'}
                </button>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                key={activeTab.path + activeTab.content.length}
                defaultLanguage={activeTab.language}
                language={activeTab.language}
                value={activeTab.content}
                onChange={handleContentChange}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
                  minimap: { enabled: true, scale: 1 },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  padding: { top: 12, bottom: 12 },
                  automaticLayout: true,
                  bracketPairColorization: { enabled: true },
                  tabSize: 2,
                  wordWrap: 'off',
                  suggest: { showKeywords: true, showSnippets: true },
                  formatOnPaste: true,
                  formatOnType: true,
                  folding: true,
                  foldingHighlight: true,
                  guides: { indentation: true, bracketPairs: true },
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#6B7280]">
            <FileCode size={32} className="mb-3 opacity-30" />
            <p className="text-sm">Open a file from the explorer to start editing</p>
            <p className="text-xs mt-1">Ctrl+K to search files · Ctrl+S to save</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TreeNode({
  node, depth = 0, activePath, onSelect, onContextMenu,
}: {
  node: FileNode; depth?: number; activePath: string | null
  onSelect: (path: string, name: string) => void
  onContextMenu: (path: string, action: 'rename' | 'delete') => void
}) {
  const [expanded, setExpanded] = useState(true)

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[#A1A1AA] hover:text-white hover:bg-[#151515] transition-colors"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <Folder size={13} className="text-[#7C6BFF]" />
          <span className="truncate">{node.name}</span>
        </button>
        <AnimatePresence>
          {expanded && node.children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {node.children.map(child => (
                <TreeNode key={child.path} node={child} depth={depth + 1} activePath={activePath} onSelect={onSelect} onContextMenu={onContextMenu} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const icon = (ext: string) => {
    const m: Record<string, any> = {
      ts: FileCode, tsx: FileCode, js: FileCode, jsx: FileCode,
      json: FileJson, png: FileImage, jpg: FileImage, svg: FileImage,
      md: FileText, txt: FileText,
    }
    const Icon = m[ext] || File
    return <Icon size={13} />
  }

  const ext = node.name.split('.').pop() || ''

  return (
    <button
      onClick={() => onSelect(node.path, node.name)}
      className={clsx(
        'w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors',
        activePath === node.path
          ? 'bg-[#7C6BFF]/10 text-white'
          : 'text-[#A1A1AA] hover:text-white hover:bg-[#151515]',
      )}
      style={{ paddingLeft: `${8 + (depth + 1) * 16}px` }}
    >
      {icon(ext)}
      <span className="truncate">{node.name}</span>
    </button>
  )
}
