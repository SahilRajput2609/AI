// src/components/workspace/ExportImportButtons.tsx
import { useRef } from 'react';

interface ExportImportProps {
  state: any;
  onExport: (json: string) => void;
  onImport: (json: string) => void;
}

export default function ExportImportButtons({ state, onExport, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = JSON.stringify({
      prompt: state.prompt,
      selectedProjectId: state.selectedProjectId,
      taskStatuses: state.taskStatuses,
    }, null, 2);
    onExport(json);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = () => {
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const json = reader.result as string;
        onImport(json);
      };
      reader.readAsText(file);
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#cca374] hover:bg-[#e2cca8]"
      >
        Export
      </button>
      <button
        onClick={handleImportClick}
        className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white"
      >
        Import
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleImportFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}
