import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    target: "node",
    outDir: "out",
    rollupOptions: {
      input: "src/index.ts",
    },
  },
  esbuild: {
    platform: "node",
  },
});
