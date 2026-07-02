import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { connectRepository } from './connect-repository.js';
import { listRepositories } from './list-repositories.js';
import { getRepositoryBranches } from './get-repository-branches.js';
import { triggerBuild } from './trigger-build.js';
import { HttpError } from '@enterprise/shared';

describe('repository use cases', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('connects a repository and creates branch metadata', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 123, name: 'example-repo', full_name: 'owner/example-repo', html_url: 'https://github.com/owner/example-repo', visibility: 'public' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ name: 'main', protected: true }, { name: 'develop', protected: false }]) });

    const prisma = {
      oAuthAccount: {
        findFirst: vi.fn().mockResolvedValue({ accessToken: 'token' }),
      },
      repository: {
        upsert: vi.fn().mockResolvedValue({ id: 'repo1', fullName: 'owner/example-repo', name: 'example-repo', url: 'https://github.com/owner/example-repo', visibility: 'public', ownerId: 'user1' }),
      },
      branch: {
        deleteMany: vi.fn().mockResolvedValue(undefined),
        createMany: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const repository = await connectRepository(prisma, 'user1', 'owner', 'example-repo');

    expect(repository.id).toBe('repo1');
    expect(prisma.oAuthAccount.findFirst).toHaveBeenCalled();
    expect(prisma.branch.deleteMany).toHaveBeenCalledWith({ where: { repositoryId: 'repo1' } });
  });

  it('throws if GitHub account is not connected', async () => {
    const prisma = {
      oAuthAccount: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as any;

    await expect(connectRepository(prisma, 'user1', 'owner', 'example-repo')).rejects.toBeInstanceOf(HttpError);
  });

  it('lists repositories for normal user and admin', async () => {
    const repoItems = [{ id: 'repo1', name: 'example', branches: [] }];
    const prisma = {
      repository: {
        findMany: vi.fn().mockResolvedValue(repoItems),
      },
    } as any;

    expect(await listRepositories(prisma, 'user1', false)).toEqual(repoItems);
    expect(await listRepositories(prisma, 'user1', true)).toEqual(repoItems);
    expect(prisma.repository.findMany).toHaveBeenCalledTimes(2);
  });

  it('returns branches for repository owner and denies other users', async () => {
    const repository = { id: 'repo1', ownerId: 'user1', branches: [{ name: 'main' }] };
    const prisma = {
      repository: {
        findUnique: vi.fn().mockResolvedValue(repository),
      },
    } as any;

    expect(await getRepositoryBranches(prisma, 'repo1', 'user1', false)).toEqual(repository.branches);
    await expect(getRepositoryBranches(prisma, 'repo1', 'user2', false)).rejects.toBeInstanceOf(HttpError);
  });

  it('triggers a build for an existing branch and rejects invalid branch', async () => {
    const repository = { id: 'repo1', ownerId: 'user1', fullName: 'owner/example-repo', branches: [{ name: 'main' }, { name: 'develop' }] };
    const prisma = {
      repository: {
        findUnique: vi.fn().mockResolvedValue(repository),
      },
      workflowRun: {
        create: vi.fn().mockResolvedValue({ id: 'run1', repository: 'owner/example-repo', branch: 'main' }),
      },
    } as any;

    const run = await triggerBuild(prisma, 'user1', 'repo1', 'main');
    expect(run.id).toBe('run1');
    await expect(triggerBuild(prisma, 'user1', 'repo1', 'feature')).rejects.toBeInstanceOf(HttpError);
  });
});
