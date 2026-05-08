import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  external: ["react", "react-dom/client"],
  splitting: false,
  sourcemap: true,
  clean: true,
});
