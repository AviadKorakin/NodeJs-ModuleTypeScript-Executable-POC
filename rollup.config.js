import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "server.ts",
  output: {
    file: "server.bundle.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [resolve(), commonjs(), typescript({ tsconfig: "./tsconfig.json" })],
};
