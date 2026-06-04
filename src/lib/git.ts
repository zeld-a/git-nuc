import { spawn } from "bun";
import { logger } from "./logger";

// Runs git with whatever arguments are passed //
export const runGit = async (args: string[]) => {
  logger.info("Running git command...", { args });

  const proc = spawn(["git", ...args]);
  const exitCode = await proc.exited;

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  if (exitCode !== 0) {
    logger.error("Git command failed", {
      args,
      exitCode,
      stderr,
    });
  
    throw new Error(
      stderr.trim() || "Git command failed."
    );

    logger.info("Git command comleted", {
      args,
      exitCode,
    });

    return {
      stdout,
      stderr,
      exitCode,
    }
  };
}
const runGitHttpBackend = () => {
  
}