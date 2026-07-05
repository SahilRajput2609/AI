export type DocType = 'api' | 'setup' | 'usage' | 'architecture' | 'readme' | 'changelog' | 'guide';

export type DocStatus = 'draft' | 'review' | 'published' | 'archived';

export interface DocSection {
  title: string;
  content: string;
  order: number;
}

export interface DocTask {
  id: string;
  targetFile: string;
  docType: DocType;
  status: DocStatus;
  sections: DocSection[];
  version?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface DocumentationState {
  tasks: DocTask[];
  publishedDocs: string[];
}
