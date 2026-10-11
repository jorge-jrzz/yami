import { existsSync, watch } from "node:fs";
import { build } from "./build-client.js";

const isDev = process.argv.includes("--dev");
const clients = new Set();
const outputEntry = new URL("./dist/assets/app.js", import.meta.url);

if (isDev || !existsSync(outputEntry)) {
  await build({ minify: !isDev });
}

const server = Bun.serve({
  port: Number(Bun.env.PORT || 3000),
  hostname: Bun.env.HOST || "0.0.0.0",
  fetch(request, activeServer) {
    const { pathname } = new URL(request.url);

    if (isDev && pathname === "/__dev") {
      if (activeServer.upgrade(request)) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    const staticFileMatch = pathname.match(/\/(assets|audio|images|documents)\/([\w.-]+)$/);
    if (staticFileMatch) {
      const [, directory, filename] = staticFileMatch;
      const file = Bun.file(new URL(`./dist/${directory}/${filename}`, import.meta.url));
      const contentType = filename.endsWith(".mp3")
        ? "audio/mpeg"
        : filename.endsWith(".webp")
          ? "image/webp"
          : filename.endsWith(".pdf")
            ? "application/pdf"
          : filename.endsWith(".jpeg") || filename.endsWith(".jpg")
            ? "image/jpeg"
            : filename.endsWith(".png")
              ? "image/png"
          : undefined;
      return file.exists().then((exists) =>
        exists
          ? new Response(file, {
              headers: contentType ? { "Content-Type": contentType } : undefined,
            })
          : new Response("Not found", { status: 404 }),
      );
    }

    if (pathname.endsWith("/") || !pathname.split("/").at(-1)?.includes(".")) {
      const html = Bun.file(new URL("./dist/index.html", import.meta.url));
      return html.text().then((contents) => {
        const page = isDev
          ? contents.replace(
              "</body>",
              '<script>(()=>{const socket=new WebSocket(`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/__dev`);socket.onmessage=()=>location.reload()})()</script></body>',
            )
          : contents;
        return new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      });
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(socket) {
      clients.add(socket);
    },
    close(socket) {
      clients.delete(socket);
    },
    message() {},
  },
});

let sourceWatcher;
let contentWatcher;
let publicWatcher;
let rebuildTimer;

if (isDev) {
  const rebuild = () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      try {
        await build({ minify: false });
        for (const client of clients) client.send("reload");
        console.log("Updated browser bundle");
      } catch (error) {
        console.error("Could not rebuild the app:", error);
      }
    }, 100);
  };
  sourceWatcher = watch("./src", { recursive: true }, rebuild);
  contentWatcher = watch("./content", { recursive: true }, rebuild);
  publicWatcher = watch("./public", { recursive: true }, rebuild);
}

let isShuttingDown = false;
const shutdown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  clearTimeout(rebuildTimer);
  sourceWatcher?.close();
  contentWatcher?.close();
  publicWatcher?.close();
  server.stop(true);
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

console.log(`${isDev ? "Development" : "Production"} server listening on http://${server.hostname}:${server.port}`);
