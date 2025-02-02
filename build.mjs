import * as esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

esbuild.build({
  logLevel: "info",
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  platform: "node",
  tsconfig: "tsconfig.json",
  format: "esm",
  loader: { ".node": "file" },
  minify: true,
  external: ["node:events"],
  inject: ["cjs-shim.ts"],
  plugins: [nodeExternalsPlugin()],
});
