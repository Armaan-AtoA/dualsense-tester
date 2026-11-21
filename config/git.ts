import process from 'node:process'
import { simpleGit } from 'simple-git'

export async function gitDefine() {
  const owner = process.env.VERCEL_GIT_REPO_OWNER || 'daidr'
  const repo = process.env.VERCEL_GIT_REPO_SLUG || 'dualsense-tester'
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'main'
  const pr = process.env.VERCEL_GIT_PULL_REQUEST_ID || ''

  let commitHash = 'local'
  let shortCommitHash = 'local'
  let commitMessage = 'Local build'
  let commitTimestamp = new Date().toISOString()

  try {
    const git = simpleGit()
    const commit = (await git.log({ n: 1 })).latest
    if (commit) {
      commitHash = commit.hash || commitHash
      shortCommitHash = commit.hash?.slice(0, 7) || shortCommitHash
      commitMessage = commit.message || commitMessage
      commitTimestamp = commit.date || commitTimestamp
    }
  }
  catch {
    // No git repository available in runtime environment
  }

  return {
    __GIT_DEFINE__: JSON.stringify({
      owner,
      repo,
      branch,
      pr,
      commitHash,
      shortCommitHash,
      commitMessage,
      commitTimestamp,
    }),
  }
}
