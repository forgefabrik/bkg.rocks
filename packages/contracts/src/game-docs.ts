export type GameDocSectionStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'deprecated'
  | 'archived';

export interface GameDocSection {
  id: string;
  docId: string;
  title: string;
  slug: string;
  status: GameDocSectionStatus;
  order: number;
  contentMarkdown: string;
  dependencies: string[];
  requiredPackages: string[];
  metadata: Record<string, unknown>;
  version?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameDoc {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  description: string;
  version: number;
  sections: GameDocSection[];
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
