import { Hono } from "hono";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "bun";

export const gitRoutes = new Hono();

gitRoutes.all("/:repo/*", async (c) => {
  const repo = c.req.param("repo");

  const repoPath = join("./repos", repo);

  if (!existsSync(repoPath)) {
    return c.text("Repository not found", 404);
  }

  const proc = spawn(["git", "http-backend"], {
    env: {
      GIT_PROJECT_ROOT: "./repos",
      GIT_HTTP_EXPORT_ALL: "1",
    
      PATH_INFO: c.req.path.replace("/repos",""),
    
      REQUEST_METHOD: c.req.method,
    
      QUERY_STRING: c.req.url.split("?")[1] ?? "",
    
      CONTENT_TYPE:
        c.req.header("content-type") ?? "",
    
      CONTENT_LENGTH:
        c.req.header("content-length") ?? "0",
    },
  });

  const raw = await new Response(proc.stdout).text();

  const separator = "\r\n\r\n";

  const index = raw.indexOf(separator);

  if (index === -1) {
    throw new Error(
      "git-http-backend returned invalid response"
    );
  }

  const headerText = raw.slice(0, index);
  const body = raw.slice(index + separator.length);

  const headers = new Headers();

  let status = 200;
  
  for (const line of headerText.split("\r\n")) {
    const colonIndex = line.indexOf(":");

    if (colonIndex === -1) {
      continue;
    }

    const key = line.slice(0, colonIndex).trim();

    const value = line
      .slice(colonIndex + 1)
      .trim();

    headers.set(key, value);

    if (key.toLowerCase() === "status") {
      status = parseInt(value, 10);
    }
  }
  
  return new Response(body, {
    status,
    headers,
  });
});