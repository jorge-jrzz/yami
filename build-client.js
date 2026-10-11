import { cp } from "node:fs/promises";

export async function build({ minify = true } = {}) {
  const result = await Bun.build({
    entrypoints: ["./src/main.jsx"],
    outdir: "./dist/assets",
    target: "browser",
    minify,
    naming: {
      entry: "app.[ext]",
      chunk: "[name]-[hash].[ext]",
      asset: "[name].[ext]",
    },
  });

  if (!result.success) {
    for (const message of result.logs) console.error(message);
    throw new Error("The client bundle could not be built");
  }

  await Bun.write("./dist/index.html", Bun.file("./index.html"));
  await cp("./public", "./dist", { recursive: true });
}
