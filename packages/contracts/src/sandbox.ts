export type SandboxSessionStatus = 'creating' | 'running' | 'paused' | 'stopped' | 'failed';
export type SandboxCommandStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'timed_out';
export type SandboxFileEncoding = 'utf8' | 'base64' | 'binary';

export interface SandboxSession {
  id: string;
  projectId: string;
  userId: string;
  status: SandboxSessionStatus;
  cwd: string;
  image: string;
  timeoutMs: number;
  networkEnabled: boolean;
  allowedHosts: string[];
  commandHistory: SandboxCommand[];
  files: SandboxFile[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  endedAt?: Date;
}

export interface SandboxFile {
  id: string;
  sessionId: string;
  path: string;
  encoding: SandboxFileEncoding;
  mimeType?: string;
  sizeBytes: number;
  sha256?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface SandboxCommand {
  id: string;
  sessionId: string;
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  timeoutMs?: number;
  status: SandboxCommandStatus;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}
