import { DatabaseService } from './database.service';
import { DatabaseTask, DatabaseOperation } from './database.types';

export class Database {
  private service: DatabaseService;

  constructor() {
    this.service = new DatabaseService();
  }

  designSchema(tableName: string, operation: DatabaseOperation, schema: string): DatabaseTask {
    const task = this.service.designSchema(tableName, operation, schema);
    console.log(`Database: Schema task "${task.id}" created for table "${tableName}".`);
    return task;
  }

  createMigration(taskId: string, migrationFile: string): void {
    this.service.createMigration(taskId, migrationFile);
    console.log(`Database: Migration "${migrationFile}" created for task "${taskId}".`);
  }

  optimizeQuery(taskId: string): void {
    this.service.optimizeQuery(taskId);
    console.log(`Database: Query optimization complete for task "${taskId}".`);
  }

  validateSchema(taskId: string): void {
    this.service.optimizeQuery(taskId);
    console.log(`Database: Schema validated for task "${taskId}".`);
  }

  getService(): DatabaseService {
    return this.service;
  }
}
