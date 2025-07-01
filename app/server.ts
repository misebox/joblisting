import { showRoutes } from "hono/dev";
import { createApp } from "honox/server";
import { serveStatic } from "hono/serve-static";
import { apiRouter } from "@/api";
import { readFile } from "fs/promises";
import { join } from "path";
import type { Context } from "hono";

const app = createApp();

// Mount API routes
app.route("/api", apiRouter);

showRoutes(app);

export default app;
