/// <reference types="vitest" />
/// <reference types="vite/client" />

import { resolve } from "path";
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "react-umami",
      // the proper extensions will be added
      fileName: "react-umami",
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
        },
      },
    },
  },
  plugins: [react(), dts({ rollupTypes: true })],
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "**.test.utils.ts"],
  },
});
