// src/utils/exportImport.ts
import { WorkflowState } from '../types/workflow';

interface ExportOptions {
  includeHistory: boolean;
}

// Export Workflow

export function exportWorkflow(state: WorkflowState, options: ExportOptions = { includeHistory: false }): string {
  const data = {
    prompt: state.prompt,
    selectedProjectId: state.selectedProjectId,
    taskStatuses: state.taskStatuses,
    history: options.includeHistory ? state.history : [] // Optional history inclusion
  };

  return JSON.stringify(data, null, 2);
}

// Import Workflow

export function importWorkflow(json: string): WorkflowState {
  try {
    const data = JSON.parse(json);
    
    // Validate required fields
    if (!data.prompt || !data.selectedProjectId) {
      throw new Error('Missing required fields in exported data');
    }
    
    const state: WorkflowState = {
      prompt: data.prompt,
      selectedProjectId: data.selectedProjectId,
      taskStatuses: data.taskStatuses || ['queued', 'queued', 'queued', 'queued'],
      history: [], // Initialize empty history unless imported
      // Initialize other fields with defaults
      terminalLogs: [],
      currentStep: 0,
      isRunning: false,
      activeFilePath: '',
      typedCode: '',
      projects: {},
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return state;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Import failed:', message);
    throw new Error('Import failed: ' + message);
  }
}