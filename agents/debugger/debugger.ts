import { DebuggerService } from './debugger.service';
import { DebugTask, ErrorSeverity, DebugResult } from './debugger.types';

export class Debugger {
  private service: DebuggerService;

  constructor() {
    this.service = new DebuggerService();
  }

  analyzeError(targetFile: string, errorType: string, severity: ErrorSeverity = 'error', errorMessage: string): DebugTask {
    const task = this.service.createTask(targetFile, errorType, severity, errorMessage);
    this.service.analyzeError(task.id);
    console.log(`Debugger: Analyzing error in "${targetFile}": ${errorType}.`);
    return task;
  }

  suggestFix(taskId: string, fix: string): void {
    this.service.suggestFix(taskId, fix);
    console.log(`Debugger: Suggested fix for task "${taskId}".`);
  }

  applyFix(taskId: string): void {
    this.service.applyFix(taskId);
    console.log(`Debugger: Applied fix for task "${taskId}".`);
  }

  verifyFix(taskId: string): DebugResult {
    const result = this.service.verifyFix(taskId, true);
    console.log(`Debugger: Fix verified for task "${taskId}": ${result.verified}.`);
    return result;
  }

  getService(): DebuggerService {
    return this.service;
  }
}
