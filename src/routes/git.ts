import { Hono } from "hono";

export const gitRoutes = new Hono();

gitRoutes.all("/:repo/*", async (c) => {
  return c.text("Git route reached");
});