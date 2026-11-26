import esbuild from "esbuild";

const prod = process.argv[2] === "production";

const context = await esbuild.context({
  entryPoints: ["main.ts"],
  bundle: true,
  // Provided by Obsidian at runtime. Add others only when actually imported.
  external: ["obsidian"],
  format: "cjs",
  // Obsidian's Plugin is a native ES class; ES5 output cannot extend it.
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
