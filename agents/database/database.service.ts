import { DatabaseTask, DatabaseOperation, DatabaseStatus, DatabaseState } from './database.types';

export class DatabaseService {
  private state: DatabaseState = {
    tasks: [],
    appliedMigrations: [],
    validatedSchemas: [],
  };

  designSchema(tableName: string, operation: DatabaseOperation, schema: string): DatabaseTask {
    const task: DatabaseTask = {
      id: `db-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tableName,
      operation,
      schema,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.state.tasks.push(task);
    return task;
  }

  createMigration(taskId: string, migrationFile: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && (task.status === 'pending' || task.status === 'validated')) {
      task.migrationFile = migrationFile;
      task.status = 'in-progress';
    }
  }

  applyMigration(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.status === 'in-progress') {
      task.status = 'applied';
      task.appliedAt = new Date().toISOString();
      if (!this.state.appliedMigrations.includes(task.migrationFile!)) {
        this.state.appliedMigrations.push(task.migrationFile!);
      }
    }
  }

  markFailed(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'failed';
    }
  }

  optimizeQuery(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'validated';
      if (!this.state.validatedSchemas.includes(task.tableName)) {
        this.state.validatedSchemas.push(task.tableName);
      }
    }
  }

  getTask(taskId: string): DatabaseTask | undefined {
    return this.state.tasks.find(t => t.id === taskId);
  }

  getTasksByStatus(status: DatabaseStatus): DatabaseTask[] {
    return this.state.tasks.filter(t => t.status === status);
  }

  getState(): DatabaseState {
    return { ...this.state };
  }
}
