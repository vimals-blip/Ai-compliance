import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/serverStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body.token || process.env.GITHUB_TOKEN;
    const rawRepo = body.repo || 'vimals-blip/HomeHERO-UPDATED';
    let branch = body.branch || 'main';

    let owner = 'vimals-blip';
    let repoName = rawRepo;

    if (rawRepo.includes('/')) {
      const parts = rawRepo.split('/');
      owner = parts[0];
      repoName = parts[1];
    }

    let liveApplied = false;
    let githubResponse: any = null;
    let errorMessage: string | null = null;
    let githubStatusCode: number = 0;

    if (token) {
      try {
        // 1. First fetch repository info to verify access and get real default branch
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Compliance-AutoRemediator/1.0',
          },
          cache: 'no-store',
        });

        if (repoRes.ok) {
          const repoData = await repoRes.json();
          if (repoData.default_branch) {
            branch = repoData.default_branch;
          }
        } else if (repoRes.status === 404) {
          return NextResponse.json({
            success: false,
            liveApplied: false,
            githubStatusCode: 404,
            message: `Repository ${owner}/${repoName} was not found on GitHub. Please verify the repository name and token access.`,
            errorMessage: 'Repository not found or token has no access.',
          });
        }

        // 2. Attempt branch protection payload
        const protectionPayload = {
          required_status_checks: null,
          enforce_admins: true,
          required_pull_request_reviews: {
            dismiss_stale_reviews: true,
            require_code_owner_reviews: false,
            required_approving_review_count: 1,
          },
          restrictions: null,
          allow_force_pushes: false,
          allow_deletions: false,
        };

        const ghRes = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/branches/${branch}/protection`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'AI-Compliance-AutoRemediator/1.0',
            },
            body: JSON.stringify(protectionPayload),
          }
        );

        githubStatusCode = ghRes.status;

        if (ghRes.ok) {
          liveApplied = true;
          githubResponse = await ghRes.json();
        } else {
          const errJson = await ghRes.json().catch(() => ({}));
          errorMessage = errJson.message || `GitHub returned HTTP ${ghRes.status}`;

          // If GitHub returns 403 (Permission denied or Free plan restriction on private repo)
          if (ghRes.status === 403) {
            console.warn(`GitHub 403 on ${owner}/${repoName}:`, errorMessage);
          }
        }
      } catch (err: any) {
        errorMessage = err.message;
        console.error('GitHub API connection error:', err);
      }
    } else {
      errorMessage = 'No GitHub Personal Access Token provided. Please configure your token in Integrations.';
    }

    const githubSettingsUrl = `https://github.com/${owner}/${repoName}/settings/branches`;

    // Only update stored evidence to compliant if live applied succeeded or if in test mode
    if (liveApplied) {
      try {
        const evidenceList = getStoredData<any[]>('evidence.json', []);
        const updatedEvidence = evidenceList.map((ev: any) => {
          if (ev.name?.includes(repoName) || ev.content?.includes(repoName)) {
            let parsed: any = {};
            try {
              parsed = typeof ev.content === 'string' ? JSON.parse(ev.content) : ev.content;
            } catch {}
            parsed.branch_protected = true;
            parsed.required_pull_request_reviews = {
              required_approving_review_count: 1,
              dismiss_stale_reviews: true,
              require_code_owner_reviews: false,
            };
            parsed.allow_force_pushes = false;
            parsed.allow_deletions = false;
            return {
              ...ev,
              status: 'VALID',
              content: JSON.stringify(parsed, null, 2),
              aiAnalysis: {
                status: 'COMPLIANT',
                confidence: 0.99,
                summary: `Branch protection rules successfully enforced on ${owner}/${repoName}:${branch}. Mandatory 1+ PR review approvals required, force pushes blocked.`,
                gaps: [],
                recommendations: ['Maintain continuous monitoring.'],
                citations: [{ document: ev.name, page: 1, text: `Repository: ${owner}/${repoName}, Branch: ${branch}, Protected: true` }],
              },
            };
          }
          return ev;
        });
        saveStoredData('evidence.json', updatedEvidence);
      } catch {}
    }

    return NextResponse.json({
      success: liveApplied,
      liveApplied,
      githubStatusCode,
      repository: `${owner}/${repoName}`,
      branch,
      githubSettingsUrl,
      message: liveApplied
        ? `Branch protection rules successfully enabled live on GitHub for ${owner}/${repoName}:${branch}!`
        : `GitHub API error (${githubStatusCode || 'Unauthorized'}): ${errorMessage}`,
      errorMessage,
      githubResponse,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
