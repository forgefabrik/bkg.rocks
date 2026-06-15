export type ProjectMembershipRole = 'owner' | 'admin' | 'maintainer' | 'developer' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
  lastSeenAt?: Date;
  revokedAt?: Date;
}

export interface ProjectMembership {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMembershipRole;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date;
}
