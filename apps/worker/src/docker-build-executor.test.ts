import { describe, expect, it } from 'vitest';

describe('docker build executor', () => {
  it('captures stdout, stderr, and artifacts from a docker build run', async () => {
    const { executeDockerBuild } = await import('./docker-build-executor.js');

    const result = await executeDockerBuild({
      id: 'job-1',
      repoUrl: 'https://example.com/repo.git',
      commands: ['npm run build'],
      image: 'node:20',
      artifactPaths: ['dist/app.js'],
      timeoutMs: 50,
      workdir: 'C:/temp',
    }, {
      spawnImpl: () => ({
        stdout: { on: (_event: string, handler: (chunk: Buffer) => void) => handler(Buffer.from('built\n')) },
        stderr: { on: (_event: string, handler: (chunk: Buffer) => void) => handler(Buffer.from('warn\n')) },
        on: (_event: string, handler: (code: number | null) => void) => handler(0),
        kill: () => undefined,
      }) as any,
      cleanup: async () => undefined,
    });

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('built');
    expect(result.stderr).toContain('warn');
    expect(result.artifacts).toContain('dist/app.js');
  });
});
