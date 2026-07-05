import { useState, useEffect } from 'react'
import { FileText, FolderOpen, Folder } from 'lucide-react'
import { api } from '../lib/api'

interface TreeNodeData {
  name: string
  type: 'folder' | 'file'
  path: string
  open?: boolean
  active?: boolean
  children?: TreeNodeData[]
}

function TreeNode({ node, depth = 0 }: { node: TreeNodeData; depth?: number }) {
  const isFolder = node.type === 'folder'
  const [open, setOpen] = useState(node.open ?? depth < 1)

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-white/5 transition-all duration-200 hover:-translate-y-[1px] will-change-transform"
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => isFolder && setOpen(!open)}
      >
        {isFolder ? (
          open ? <FolderOpen size={14} className="text-accent-primary" /> : <Folder size={14} className="text-text-muted" />
        ) : (
          <FileText size={14} className={node.active ? 'text-accent-primary' : 'text-text-muted'} />
        )}
        <span className={node.active ? 'text-accent-primary font-medium' : 'text-text-secondary'}>{node.name}</span>
      </div>
      {isFolder && open && node.children && (
        <div className="overflow-hidden">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FilesScreen() {
  const [tree, setTree] = useState<TreeNodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getFiles()
      setTree(data.tree || [])
    } catch {
      setError('Failed to load files')
    }
    setLoading(false)
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-red-400">
        {error}
        <button onClick={fetchFiles} className="ml-3 text-text-muted hover:text-text-primary underline cursor-pointer">Retry</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Loading files...
      </div>
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[280px] flex-shrink-0 bg-surface-sidebar border-r border-white/5 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <span className="text-xs font-semibold text-text-primary tracking-wide">EXPLORER</span>
          <div className="flex gap-2 text-text-muted">
            <button className="hover:text-text-primary cursor-pointer transition-colors" title="New File">+</button>
          </div>
        </div>
        <div className="flex-1 py-2 overflow-auto">
          {tree.length === 0 ? (
            <p className="text-xs text-text-muted px-4 py-2">No files yet. Create a project to get started.</p>
          ) : (
            tree.map((node, i) => <TreeNode key={i} node={node} />)
          )}
        </div>
      </div>
      <div className="flex-1 bg-surface-bg flex items-center justify-center">
        <div className="text-center">
          <FileText className="text-text-muted mx-auto mb-3" size={48} />
          <p className="text-sm text-text-muted">Select a file to preview</p>
        </div>
      </div>
    </div>
  )
}
