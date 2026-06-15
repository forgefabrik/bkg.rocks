export interface SandboxRequest {
  code: string;
  timeoutMs?: number;
}

export interface SandboxResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runSandbox(request: SandboxRequest): Promise<SandboxResult> {
  return {
    exitCode: 0,
    stdout: request.code,
    stderr: "",
  };
}
