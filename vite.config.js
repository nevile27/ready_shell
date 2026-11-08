import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve("web"),
  base: "./",
  build: {
    outDir: resolve("web/dist"),
    emptyOutDir: true,
  },
});
