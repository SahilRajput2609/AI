'use client'

import { motion } from 'framer-motion'
import { ChevronRight, File, Folder } from 'lucide-react'
import { useState } from 'react'

export interface FileTreeNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileTreeNode[]
}

export function FileTree({ nodes = [] }: { nodes?: FileTreeNode[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleFolder = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderNode = (node: FileTreeNode, level = 0) => (
    <div key={node.id}>
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 cursor-pointer group hover:bg-[#111] rounded-lg transition-colors"
        onClick={() => node.type === 'folder' && toggleFolder(node.id)}
        whileHover={{ x: 4 }}
      >
        {node.type === 'folder' && (
          <motion.div
            animate={{ rotate: expanded.has(node.id) ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <ChevronRight size={16} className="text-[#6B7280]" />
          </motion.div>
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {node.type === 'folder' ? (
            <Folder size={16} className="text-[#7C6BFF] flex-shrink-0" />
          ) : (
            <File size={16} className="text-[#6B7280] flex-shrink-0" />
          )}
          <span className="text-sm text-[#A1A1AA] group-hover:text-white truncate">{node.name}</span>
        </div>
      </motion.div>

      {node.type === 'folder' && expanded.has(node.id) && node.children && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-l border-[#202020] ml-2"
        >
          {node.children.map((child) => (
            <div key={child.id} className="ml-2">
              {renderNode(child, level + 1)}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#0a0a0a] border border-[#202020] rounded-lg p-4 font-mono text-xs"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Files</h3>
      <div className="space-y-1">{nodes.map((node) => renderNode(node))}</div>
    </motion.div>
  )
}
