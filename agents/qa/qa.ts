import { QAService } from './qa.service'
import type { QATask, TestType, TestResult } from './qa.types'

export class QA {
  private service: QAService

  constructor() {
    this.service = new QAService()
  }

  writeTests(targetFile: string, testType: TestType, testFile: string): QATask {
    const task = this.service.createTask(targetFile, testType)
    this.service.startWriting(task.id, testFile)
    console.log(`QA: Writing ${testType} tests for "${targetFile}" -> "${testFile}".`)
    return task
  }

  runTests(taskId: string, result: TestResult): void {
    this.service.startRunning(taskId)
    this.service.recordResult(taskId, result)
    console.log(`QA: Tests for "${taskId}" complete: ${result.passed}/${result.totalTests} passed.`)
  }

  validateCoverage(taskId: string): void {
    const task = this.service.getTask(taskId)
    if (task && task.result) {
      console.log(`QA: Coverage for "${taskId}": ${task.result.coverage}%.`)
    }
  }

  reportResults(taskId: string): QATask | undefined {
    const task = this.service.getTask(taskId)
    if (task) {
      this.service.markReviewed(taskId)
      console.log(`QA: Results reported for task "${taskId}".`)
    }
    return task
  }

  getService(): QAService {
    return this.service
  }
}
