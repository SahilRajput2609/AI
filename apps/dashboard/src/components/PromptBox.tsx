import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Paperclip, X, Code, FileImage, FileText, Zap } from 'lucide-react'
import { suggestionChips, projectTypes, type ProjectType } from '../data/project-types'

interface PromptBoxProps {
  onSubmit: (prompt: string, files?: File[]) => void
  isLoading?: boolean
  placeholder?: string
}

export function PromptBox({
  onSubmit,
  isLoading = false,
  placeholder = 'Describe what you want to build...',
}: PromptBoxProps) {
  const [prompt, setPrompt] = useState('')
  const [showTypes, setShowTypes] = useState(false)
  const [selectedType, setSelectedType] = useState<ProjectType>('custom')
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [prompt])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setShowTypes(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return
    onSubmit(prompt.trim(), files.length > 0 ? files : undefined)
    setPrompt('')
    setFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const handleFileSelect = () => fileInputRef.current?.click()

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index))

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Type selector */}
      <div ref={typeRef} className="relative mb-3">
        <button
          onClick={() => setShowTypes(!showTypes)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#202020] bg-[#080808] text-xs text-[#A1A1AA] hover:border-[#333] transition-all"
        >
          <Zap size={12} className="text-[#7C6BFF]" />
          {projectTypes.find((t) => t.value === selectedType)?.label || 'Custom'}
        </button>
        <AnimatePresence>
          {showTypes && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 top-full mt-1 w-56 bg-[#0F0F0F] border border-[#202020] rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
            >
              {['Frontend', 'Backend', 'Full Application', 'Desktop & Mobile', 'AI & Advanced', 'Other'].map((cat) => (
                <div key={cat}>
                  <div className="px-3 py-1.5 text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">
                    {cat}
                  </div>
                  {projectTypes
                    .filter((t) => t.category === cat)
                    .map((t) => (
                      <button
                        key={t.value}
                        onClick={() => {
                          setSelectedType(t.value)
                          setShowTypes(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          selectedType === t.value
                            ? 'text-white bg-[#7C6BFF]/10'
                            : 'text-[#A1A1AA] hover:text-white hover:bg-[#151515]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main input area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="relative bg-[#0F0F0F] border border-[#202020] rounded-2xl focus-within:border-[#7C6BFF]/40 focus-within:ring-1 focus-within:ring-[#7C6BFF]/20 transition-all duration-200"
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent text-sm text-white placeholder-[#6B7280] outline-none resize-none px-5 pt-4 pb-14 leading-relaxed"
        />

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handleFileSelect}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#A1A1AA] hover:bg-[#151515] transition-all"
              title="Attach files"
            >
              <Paperclip size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
            />
            <button
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#A1A1AA] hover:bg-[#151515] transition-all"
              title="Use camera"
            >
              <Sparkles size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B7280]">{prompt.length}/10000</span>
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Generate <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F0F0F] border border-[#202020] text-xs text-[#A1A1AA]"
              >
                {file.type.startsWith('image/') ? (
                  <FileImage size={12} />
                ) : file.type.includes('pdf') ? (
                  <FileText size={12} />
                ) : (
                  <Code size={12} />
                )}
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button onClick={() => removeFile(i)} className="text-[#6B7280] hover:text-white ml-1">
                  <X size={12} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {suggestionChips.slice(0, 4).map((chip) => (
          <button
            key={chip}
            onClick={() => setPrompt(chip)}
            className="px-3 py-1.5 rounded-lg border border-[#202020] bg-[#080808] text-xs text-[#6B7280] hover:text-[#A1A1AA] hover:border-[#333] hover:bg-[#0F0F0F] transition-all"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
