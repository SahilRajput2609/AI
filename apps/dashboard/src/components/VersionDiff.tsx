import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  GitCompare,
  RotateCcw,
  Plus,
  Minus,
  Edit3,
  FileCode,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { clsx } from './utils/clsx'
import { api } from '../lib/api'

interface DiffChange {
  path: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
}

interface VersionDiffProps {
  projectId: string
  onClose: () => void
}

export function VersionDiff({ projectId, onClose }: VersionDiffProps) {
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedA, setSelectedA] = useState<string | null>(null)
  const [selectedB, setSelectedB] = useState<string | null>(null)
  const [diff, setDiff] = useState<{
    versionA: any
    versionB: any
    changes: DiffChange[]
    summary: { added: number; removed: number; modified: number; unchanged: number; total: number }
  } | null>(null)
  const [diffLoading, setDiffLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  useEffect(() => {
    api
      .getVersions(projectId)
      .then((data) => {
        setVersions(data)
        if (data.length >= 2) {
          setSelectedA(data[1].id)
          setSelectedB(data[0].id)
        } else if (data.length === 1) {
          setSelectedA(data[0].id)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  const handleCompare = async () => {
    if (!selectedA || !selectedB || selectedA === selectedB) return
    setDiffLoading(true)
    try {
      const result = await api.diffVersions(selectedA, selectedB)
      setDiff(result)
    } catch {
    } finally {
      setDiffLoading(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId)
    try {
      await api.restoreVersion(versionId)
    } catch {
    } finally {
      setRestoring(null)
    }
  }

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
        <GitCompare size={14} className="text-[#7C6BFF]" />
        <span className="text-sm font-medium text-white">Version Diff</span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={16} className="text-[#7C6BFF] animate-spin" />
        </div>
      ) : versions.length < 2 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[#6B7280] gap-2">
          <GitCompare size={28} />
          <p className="text-sm">Need at least 2 versions to compare</p>
          <p className="text-xs">Create a snapshot first</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Version selector */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#202020] bg-[#0A0A0A] flex-shrink-0">
            <div className="flex-1">
              <label className="text-[10px] text-[#6B7280] block mb-1">Older</label>
              <select
                value={selectedA || ''}
                onChange={(e) => setSelectedA(e.target.value)}
                className="w-full bg-[#080808] border border-[#202020] rounded-lg px-2 py-1.5 text-xs text-white outline-none"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.version_number} - {v.title}
                  </option>
                ))}
              </select>
            </div>
            <ArrowRight size={14} className="text-[#6B7280] mt-4" />
            <div className="flex-1">
              <label className="text-[10px] text-[#6B7280] block mb-1">Newer</label>
              <select
                value={selectedB || ''}
                onChange={(e) => setSelectedB(e.target.value)}
                className="w-full bg-[#080808] border border-[#202020] rounded-lg px-2 py-1.5 text-xs text-white outline-none"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.version_number} - {v.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCompare}
              disabled={!selectedA || !selectedB || selectedA === selectedB || diffLoading}
              className="mt-4 px-3 py-1.5 rounded-lg bg-[#7C6BFF] text-white text-xs font-medium hover:bg-[#6A5BEF] disabled:opacity-30 transition-all flex items-center gap-1"
            >
              {diffLoading ? <Loader2 size={12} className="animate-spin" /> : <GitCompare size={12} />}
              Compare
            </button>
          </div>

          {/* Diff results */}
          <div className="flex-1 overflow-y-auto">
            {diff ? (
              <div className="p-4 space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      label: 'Added',
                      count: diff.summary.added,
                      color: 'text-[#22C55E]',
                      bg: 'bg-[#22C55E]/10',
                      icon: Plus,
                    },
                    {
                      label: 'Removed',
                      count: diff.summary.removed,
                      color: 'text-[#EF4444]',
                      bg: 'bg-[#EF4444]/10',
                      icon: Minus,
                    },
                    {
                      label: 'Modified',
                      count: diff.summary.modified,
                      color: 'text-[#FACC15]',
                      bg: 'bg-[#FACC15]/10',
                      icon: Edit3,
                    },
                    {
                      label: 'Unchanged',
                      count: diff.summary.unchanged,
                      color: 'text-[#6B7280]',
                      bg: 'bg-[#6B7280]/10',
                      icon: CheckCircle,
                    },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <s.icon size={12} className={s.color} />
                        <span className={`text-[10px] ${s.color}`}>{s.label}</span>
                      </div>
                      <p className={`text-lg font-semibold ${s.color}`}>{s.count}</p>
                    </div>
                  ))}
                </div>

                {/* Changed files list */}
                {diff.changes.filter((c) => c.type !== 'unchanged').length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-[#A1A1AA] mb-2">Changed Files</h4>
                    <div className="space-y-0.5">
                      {diff.changes
                        .filter((c) => c.type !== 'unchanged')
                        .map((change) => (
                          <div
                            key={change.path}
                            className={clsx(
                              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                              change.type === 'added'
                                ? 'bg-[#22C55E]/5 text-[#22C55E]'
                                : change.type === 'removed'
                                  ? 'bg-[#EF4444]/5 text-[#EF4444]'
                                  : 'bg-[#FACC15]/5 text-[#FACC15]',
                            )}
                          >
                            {change.type === 'added' ? (
                              <Plus size={12} />
                            ) : change.type === 'removed' ? (
                              <Minus size={12} />
                            ) : (
                              <Edit3 size={12} />
                            )}
                            <FileCode size={12} className="opacity-50" />
                            <span className="font-mono">{change.path}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {diff.summary.total === 0 && (
                  <div className="text-center py-8 text-[#6B7280]">
                    <CheckCircle size={24} className="mx-auto mb-2" />
                    <p className="text-sm">No differences</p>
                    <p className="text-xs mt-1">These versions are identical</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#6B7280] gap-2">
                <GitCompare size={24} />
                <p className="text-sm">Select two versions and click Compare</p>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          {diff && (
            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#202020] bg-[#0A0A0A] flex-shrink-0">
              <button
                onClick={() => handleRestore(selectedB!)}
                disabled={restoring !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C6BFF] text-white text-xs font-medium hover:bg-[#6A5BEF] disabled:opacity-50 transition-all"
              >
                {restoring ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                Restore Newer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
