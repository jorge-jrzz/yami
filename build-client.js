import { mkdir } from "node:fs/promises";

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
  await mkdir("./dist/audio", { recursive: true });
  await Bun.write(
    "./dist/audio/cepillin.mp3",
    Bun.file("./public/audio/cepillin.mp3"),
  );
  await mkdir("./dist/images", { recursive: true });
  await Bun.write(
    "./dist/images/yamita.webp",
    Bun.file("./public/images/yamita.webp"),
  );
}
