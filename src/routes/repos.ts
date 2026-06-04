import { Hono } from "hono";
import { createRepo, listRepos } from "../lib/repos";

export const repoRoutes = new Hono();
repoRoutes.get("/", async (c) => {
  const repos = await listRepos();

  return c.html(`
    <h1>Repositories</h1>

    <ul>
      ${repos.map((repo) => `<li>${repo}</li>`).join("")}
    </ul>

    <form method="POST" action="/repos/create">
      <input
        name="repoName"
        placeholder="Repository name"
      />

      <button type="submit">
        Create Repo
      </button>
    </form>
  `);
})

repoRoutes.post("/create", async (c) => {
  const body = await c.req.parseBody();

  const repoName = String(body.repoName);

  await createRepo(repoName);

  return c.redirect("/repos");
});