import { spawn } from 'node:child_process';
export interface DockerBuildExecutorDependencies {
    spawnImpl?: typeof spawn;
    cleanup?: (path: string) => Promise<void>;
}
export interface DockerBuildRequest {
    id: string;
    repoUrl: string;
    commands: string[];
    image?: string;
    artifactPaths?: string[];
    timeoutMs?: number;
    workdir?: string;
}
export interface DockerBuildResult {
    success: boolean;
    stdout: string;
    stderr: string;
    artifacts: string[];
    exitCode: number | null;
    timedOut: boolean;
    durationMs: number;
}
export declare function executeDockerBuild(request: DockerBuildRequest, deps?: DockerBuildExecutorDependencies): Promise<DockerBuildResult>;
