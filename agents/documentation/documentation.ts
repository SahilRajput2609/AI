import { DocumentationService } from './documentation.service';
import { DocTask, DocType, DocSection } from './documentation.types';

export class Documentation {
  private service: DocumentationService;

  constructor() {
    this.service = new DocumentationService();
  }

  generateDocs(targetFile: string, docType: DocType, sections: { title: string; content: string; order: number }[]): DocTask {
    const task = this.service.createTask(targetFile, docType);
    for (const section of sections) {
      this.service.addSection(task.id, section.title, section.content, section.order);
    }
    console.log(`Documentation: Generated "${docType}" docs for "${targetFile}".`);
    return task;
  }

  updateDocs(taskId: string, title: string, content: string, order: number): void {
    this.service.addSection(taskId, title, content, order);
    console.log(`Documentation: Updated doc task "${taskId}".`);
  }

  reviewDocs(taskId: string): void {
    this.service.submitForReview(taskId);
    console.log(`Documentation: Submitted "${taskId}" for review.`);
  }

  publishDocs(taskId: string): void {
    this.service.publish(taskId);
    console.log(`Documentation: Published docs for task "${taskId}".`);
  }

  getService(): DocumentationService {
    return this.service;
  }
}
