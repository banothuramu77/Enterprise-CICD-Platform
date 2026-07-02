import { HttpError } from '@enterprise/shared';
import { enqueueBuildJob } from './enqueue-build-job.js';
import { publishBuildJob } from '../../lib/rabbitmq.js';
export async function triggerBuild(prisma, userId, repositoryId, branch) {
    const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        include: { branches: true },
    });
    if (!repository) {
        throw new HttpError(404, 'Repository not found', 'REPOSITORY_NOT_FOUND');
    }
    if (repository.ownerId !== userId) {
        throw new HttpError(403, 'Access denied to repository', 'REPOSITORY_ACCESS_DENIED');
    }
    let selectedBranch = branch;
    if (!selectedBranch) {
        selectedBranch = repository.branches[0]?.name;
    }
    if (!selectedBranch) {
        throw new HttpError(400, 'No branch specified and repository has no branches', 'BUILD_BRANCH_REQUIRED');
    }
    const branchExists = repository.branches.some((repoBranch) => repoBranch.name === selectedBranch);
    if (!branchExists) {
        throw new HttpError(400, 'Branch does not exist on repository', 'BUILD_INVALID_BRANCH');
    }
    const workflowRun = await prisma.workflowRun.create({
        data: {
            repository: repository.fullName,
            branch: selectedBranch,
            userId,
            repositoryId: repository.id,
        },
    });
    await enqueueBuildJob(prisma, { publishBuildJob }, {
        id: workflowRun.id,
        repository: repository.fullName,
        branch: selectedBranch,
        status: workflowRun.status,
    });
    return workflowRun;
}
//# sourceMappingURL=trigger-build.js.map