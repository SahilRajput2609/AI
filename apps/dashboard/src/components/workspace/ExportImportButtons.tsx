import { useRef } from 'react'

interface ExportImportProps {
  state: any
  onExport: (json: string) => void
  onImport: (json: string) => void
}

export default function ExportImportButtons({ state, onExport, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = JSON.stringify(
      {
        prompt: state.prompt,
        selectedProjectId: state.selectedProjectId,
        taskStatuses: state.taskStatuses,
      },
      null,
      2,
    )
    onExport(json)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportFile = () => {
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0]
      const reader = new FileReader()
      reader.onload = () => onImport(reader.result as string)
      reader.readAsText(file)
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="h-8 px-3 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all"
      >
        Export
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="h-8 px-3 rounded-lg border border-[#202020] bg-transparent text-xs text-[#A8A8A8] hover:bg-[#080808] hover:border-[#333] transition-all"
      >
        Import
      </button>
      <input type="file" ref={fileInputRef} accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
    </div>
  )
}
