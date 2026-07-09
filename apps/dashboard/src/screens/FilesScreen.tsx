import { useState, useEffect } from 'react'
import { FileText, FolderOpen, Folder } from 'lucide-react'
import { api } from '../lib/api'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonTable } from '../components/ui/Skeleton'

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
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-[#080808] transition-colors"
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => isFolder && setOpen(!open)}
      >
        {isFolder ? (
          open ? <FolderOpen size={14} className="text-[#A8A8A8]" /> : <Folder size={14} className="text-[#6E6E6E]" />
        ) : (
          <FileText size={14} className="text-[#6E6E6E]" />
        )}
        <span className="text-[#A8A8A8]">{node.name}</span>
      </div>
      {isFolder && open && node.children && (
        <div>
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

  useEffect(() => { fetchFiles() }, [])

  async function fetchFiles() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getFiles()
      setTree(data.tree || [])
    } catch { setError('Failed to load files') }
    setLoading(false)
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#EF4444]">
        {error}
        <button onClick={fetchFiles} className="ml-3 text-[#6E6E6E] hover:text-white underline cursor-pointer">Retry</button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[280px] flex-shrink-0 border-r border-[#202020] flex flex-col">
        <div className="px-4 py-3 border-b border-[#202020]">
          <span className="text-xs font-medium text-[#6E6E6E] uppercase tracking-wider">Explorer</span>
        </div>
        <div className="flex-1 py-2 overflow-auto">
          {loading ? (
            <div className="p-4"><SkeletonTable rows={5} /></div>
          ) : tree.length === 0 ? (
            <EmptyState title="No files yet" description="Create a project to get started." />
          ) : (
            tree.map((node, i) => <TreeNode key={i} node={node} />)
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="text-[#333] mx-auto mb-3" size={40} />
          <p className="text-sm text-[#6E6E6E]">Select a file to preview</p>
        </div>
      </div>
    </div>
  )
}
