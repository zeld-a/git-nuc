import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { repoRoutes } from "./routes/repos";
import { logger } from "./lib/logger";
import { gitRoutes } from "./routes/git";

const app = new Hono();

app.use("*", async (c, next) => {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;

  logger.info("Request completed", {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
  });
});

app.use("/public/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
  return c.html(`
    <html>
      <head>
        <title>Git-Nuc</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="p-6 bg-gray-100">
        <div class="max-w-xl mx-auto bg-white p-6 rounded shadow">
          <h1 class="text-2xl font-bold">Git-Nuc</h1>
          <p class="text-gray-600 mt-2">Server is running!</p>
        </div>
      </body>
    </html>
    `);
})

app.get("/health", (c) => {
  return c.json({
    ok: true,
    time: new Date().toISOString(),
  });
});

app.onError((err, c) => {
  logger.error("Unhandled error", {
    error: err.message,
    path: c.req.path,
  });
  return c.text("Internal Server Error", 500);
});

app.route("/repos", repoRoutes);
app.route("/repos", gitRoutes);

export default app;

