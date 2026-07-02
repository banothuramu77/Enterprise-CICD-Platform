import { HttpError } from '@enterprise/shared';
export async function connectRepository(prisma, userId, owner, repo) {
    const oauthAccount = await prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'github' },
    });
    if (!oauthAccount?.accessToken) {
        throw new HttpError(400, 'GitHub account is not connected', 'GITHUB_ACCOUNT_NOT_CONNECTED');
    }
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
            Authorization: `Bearer ${oauthAccount.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });
    if (!repoResponse.ok) {
        throw new HttpError(repoResponse.status, 'Unable to fetch repository metadata from GitHub', 'GITHUB_REPOSITORY_FETCH_FAILED', { owner, repo, status: repoResponse.status });
    }
    const githubRepo = (await repoResponse.json());
    if (!githubRepo?.id) {
        throw new HttpError(404, 'GitHub repository not found', 'GITHUB_REPOSITORY_NOT_FOUND');
    }
    const branchesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
        headers: {
            Authorization: `Bearer ${oauthAccount.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });
    if (!branchesResponse.ok) {
        throw new HttpError(branchesResponse.status, 'Unable to fetch repository branches from GitHub', 'GITHUB_BRANCHES_FETCH_FAILED', { owner, repo, status: branchesResponse.status });
    }
    const githubBranches = (await branchesResponse.json());
    const repository = await prisma.repository.upsert({
        where: { githubRepoId: String(githubRepo.id) },
        update: {
            ownerId: userId,
            name: githubRepo.name,
            fullName: githubRepo.full_name,
            url: githubRepo.html_url,
            visibility: githubRepo.visibility,
        },
        create: {
            githubRepoId: String(githubRepo.id),
            ownerId: userId,
            name: githubRepo.name,
            fullName: githubRepo.full_name,
            url: githubRepo.html_url,
            visibility: githubRepo.visibility,
        },
    });
    await prisma.branch.deleteMany({ where: { repositoryId: repository.id } });
    if (githubBranches.length > 0) {
        await prisma.branch.createMany({
            data: githubBranches.map((branch) => ({
                repositoryId: repository.id,
                name: branch.name,
                protected: branch.protected ?? false,
            })),
            skipDuplicates: true,
        });
    }
    return repository;
}
//# sourceMappingURL=connect-repository.js.map