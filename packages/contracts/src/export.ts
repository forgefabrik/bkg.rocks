export type SecurityReportStatus = 'pending' | 'passed' | 'failed' | 'skipped';
export type SecurityFindingSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface BuildArtifact {
  id: string;
  name: string;
  path: string;
  mediaType?: string;
  sha256: string;
  sizeBytes: number;
  createdAt: Date;
}

export interface BuildManifest {
  id: string;
  projectId: string;
  buildId: string;
  version: string;
  artifacts: BuildArtifact[];
  dependencies: Record<string, string>;
  environment: Record<string, string>;
  createdAt: Date;
}

export interface SecurityFinding {
  id: string;
  severity: SecurityFindingSeverity;
  title: string;
  description: string;
  location?: string;
  remediation?: string;
}

export interface SecurityReport {
  id: string;
  packageId: string;
  status: SecurityReportStatus;
  findings: SecurityFinding[];
  scannerVersion: string;
  summary: {
    total: number;
    info: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  scannedAt: Date;
}

export interface ExportPackage {
  id: string;
  projectId: string;
  manifest: BuildManifest;
  files: BuildArtifact[];
  securityReport?: SecurityReport;
  createdAt: Date;
  expiresAt?: Date;
}
