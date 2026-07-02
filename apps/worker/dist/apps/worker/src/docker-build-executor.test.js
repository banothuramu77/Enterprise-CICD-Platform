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
                stdout: { on: (_event, handler) => handler(Buffer.from('built\n')) },
                stderr: { on: (_event, handler) => handler(Buffer.from('warn\n')) },
                on: (_event, handler) => handler(0),
                kill: () => undefined,
            }),
            cleanup: async () => undefined,
        });
        expect(result.success).toBe(true);
        expect(result.stdout).toContain('built');
        expect(result.stderr).toContain('warn');
        expect(result.artifacts).toContain('dist/app.js');
    });
});
//# sourceMappingURL=docker-build-executor.test.js.map