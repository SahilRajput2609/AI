export type DatabaseOperation = 'create' | 'alter' | 'drop' | 'migrate' | 'optimize' | 'seed';

export type DatabaseStatus = 'pending' | 'in-progress' | 'validated' | 'applied' | 'failed';

export interface DatabaseTask {
  id: string;
  tableName: string;
  operation: DatabaseOperation;
  schema: string;
  status: DatabaseStatus;
  migrationFile?: string;
  createdAt: string;
  appliedAt?: string;
}

export interface DatabaseState {
  tasks: DatabaseTask[];
  appliedMigrations: string[];
  validatedSchemas: string[];
}
