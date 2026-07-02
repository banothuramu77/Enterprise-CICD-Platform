import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { logger } from '../../backend/src/lib/logger.js';
export async function executeDockerBuild(request, deps = {}) {
    const startedAt = Date.now();
    const workdir = request.workdir ?? await mkdtemp(join(tmpdir(), 'cicd-build-'));
    const stdoutChunks = [];
    const stderrChunks = [];
    let timedOut = false;
    let exitCode = null;
    const dockerArgs = [
        'run',
        '--rm',
        '--network=none',
        '--cap-drop=ALL',
        '--security-opt',
        'no-new-privileges:true',
        '--read-only',
        '--tmpfs',
        '/tmp:rw,noexec,nosuid,size=64m',
        '-v',
        `${workdir}:/workspace`,
        '-w',
        '/workspace',
        request.image ?? 'node:20',
        'sh',
        '-c',
        [
            'set -e',
            `git clone ${request.repoUrl} repo`,
            'cd repo',
            ...request.commands,
        ].join(' && '),
    ];
    const child = (deps.spawnImpl ?? spawn)('docker', dockerArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout?.on('data', (chunk) => {
        const text = chunk.toString();
        stdoutChunks.push(text);
    });
    child.stderr?.on('data', (chunk) => {
        const text = chunk.toString();
        stderrChunks.push(text);
    });
    const timeoutMs = request.timeoutMs ?? 10 * 60 * 1000;
    const timeout = setTimeout(() => {
        if (exitCode !== null) {
            return;
        }
        timedOut = true;
        child.kill('SIGTERM');
    }, timeoutMs);
    const result = await new Promise((resolve) => {
        child.on('close', async (code) => {
            clearTimeout(timeout);
            exitCode = code;
            const stdout = stdoutChunks.join('');
            const stderr = stderrChunks.join('');
            const artifacts = request.artifactPaths ?? [];
            resolve({
                success: !timedOut && exitCode === 0,
                stdout,
                stderr,
                artifacts,
                exitCode,
                timedOut,
                durationMs: Date.now() - startedAt,
            });
        });
    });
    try {
        await (deps.cleanup ?? rm)(workdir);
    }
    catch (error) {
        logger.warn(`Unable to clean up build workspace ${workdir}: ${error instanceof Error ? error.message : error}`);
    }
    logger.info(`Docker build ${request.id} completed with exit code ${result.exitCode}`);
    return result;
}
//# sourceMappingURL=docker-build-executor.js.map