// build.mjs
import { config } from "dotenv";
import esbuild from "esbuild";

// 1. Load .env into process.env
const env = config().parsed || {};

// 2. Convert to esbuild define-map:
//    { 'process.env.KEY': '"value"', … }
const define = Object.fromEntries(
  Object.entries(env).map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
);

// 3. Call esbuild with define
esbuild
  .build({
    entryPoints: ["server.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: ["node22"],
    define, // ← here’s where .env is inlined
    sourcemap: true,
    outfile: "server.bundle.js",
  })
  .catch(() => process.exit(1));
