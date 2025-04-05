// esbuild.config.js
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    platform: "node",
    target: "node22",
    outfile: "dist/main.js",
    external: [], // You can put native node modules here like ['fs', 'path'] if needed
  })
  .catch(() => process.exit(1));
