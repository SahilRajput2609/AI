import { ReviewerService } from './reviewer.service';
import { ReviewTask, ReviewType, ReviewFeedback } from './reviewer.types';

export class Reviewer {
  private service: ReviewerService;

  constructor() {
    this.service = new ReviewerService();
  }

  reviewCode(targetFile: string, reviewType: ReviewType = 'code-review', reviewer: string = 'system'): ReviewTask {
    const task = this.service.createTask(targetFile, reviewType);
    this.service.startReview(task.id, reviewer);
    console.log(`Reviewer: Reviewing "${targetFile}" (${reviewType}).`);
    return task;
  }

  approveChanges(taskId: string): void {
    this.service.approve(taskId);
    console.log(`Reviewer: Approved changes for task "${taskId}".`);
  }

  requestChanges(taskId: string, feedback: ReviewFeedback): void {
    this.service.addFeedback(taskId, feedback);
    this.service.requestChanges(taskId);
    console.log(`Reviewer: Requested changes for task "${taskId}".`);
  }

  getReviewStatus(taskId: string): ReviewTask | undefined {
    return this.service.getTask(taskId);
  }

  getService(): ReviewerService {
    return this.service;
  }
}
