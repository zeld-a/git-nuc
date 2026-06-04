import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "bun";
import { logger } from "./logger";

const REPO_DIR = "./repos";

// Returns an array of repository names. //
export const listRepos = async () => {
  logger.info("Listing repositories");

  const entries = await readdir(REPO_DIR);
  const repos = entries.filter((name) => name.endsWith(".git"));

  logger.info("Repositories listed", {
    count: repos.length,
  });

  return repos;
};

// Creates a repo with the specified string. //
export const createRepo = async (name: string) => {
  try {
    // Repository name can only include alphanumeric characters, underscores, and hyphens. //
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error("Invalid repository name");
    }

    const repoPath = join(REPO_DIR, `${name}.git`);

    if (existsSync(repoPath)) {
      throw new Error("Repository already exists");
    }

    logger.info("Creating repository", {
      repo: name,
    });

    const command = ["git", "init", "--bare", repoPath];

    logger.info("Running git command", {
      command,
    });

    const proc = spawn(command);

    const exitCode = await proc.exited;
    const stderr = await new Response(proc.stderr).text();

    if (exitCode !== 0) {
      logger.error("Git command failed", {
        command,
        exitCode,
        stderr,
      });

      throw new Error(
        stderr.trim() || "Failed to initialize repository"
      );
    }

    logger.info("Git command completed", {
      command,
      exitCode,
    });

    logger.info("Repository created", {
      repo: name,
      path: repoPath,
    });

    return repoPath;
  } catch (error) {
    logger.error("Repository creation failed", {
      repo: name,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
};