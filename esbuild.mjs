import { context } from "esbuild";
import { rmSync } from "fs";
import { nodeExternalsPlugin } from "esbuild-node-externals";

const args = process.argv.slice(2);
const isWatch = args.includes("--watch");

// Remove the previous build directory
rmSync("./.local/express/dist", { recursive: true, force: true });

// Run esbuild with the specified options
const ctx = await context({
  entryPoints: ["src/server/express/server.ts"],
  bundle: true,
  sourcemap: true,
  minify: true,
  format: "esm",
  platform: "node",
  target: "node20",
  external: [],
  outfile: "./.local/express/dist/api.js",
  tsconfig: "./tsconfig.json",
  plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));

if (isWatch) {
  await ctx.watch();
} else {
  ctx.rebuild();
  ctx.dispose();
}
