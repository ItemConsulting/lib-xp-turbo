import { globSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { transform } from "@swc/core";
import { defineConfig } from "tsdown";

const SRC = "src/main/resources";
const DST = "build/resources/main";

const logLevel: "silent" | "info" = ["QUIET", "WARN"].includes(process.env.LOG_LEVEL_FROM_GRADLE || "")
  ? "silent"
  : "info";

// Enonic XP loads each controller/service/task by its resource path, so every
// source file must become its own output file with the directory tree intact.
// Turn a glob into a tsdown `entry` map ({ "relative/name": "src/path/file.ts" }).
function entries(dir: string, exts: string, exclude: string[] = []): Record<string, string> {
  return Object.fromEntries(
    globSync(`${dir}/**/*.${exts}`, { exclude }).map((match) => {
      // globSync returns platform separators; entry keys and paths must be posix.
      const file = match.replaceAll(sep, "/");
      return [file.slice(dir.length + 1).replace(/\.[^.]+$/, ""), file];
    }),
  );
}

const serverEntry = entries(SRC, "{ts,js}", ["**/*.d.ts"]);

// XP resolves absolute imports at runtime: against the app's own resources
// first, then against the modules provided by the runtime: XP's own libraries
// (/lib/xp/*), libraries `include`d in build.gradle, modules from other apps.
// Leave all of them to the runtime, including imports between this library's
// own source files, so each source file becomes exactly one output file. Only
// npm packages are bundled. A mistyped specifier is caught by `check:types`
// (TS2307), not by the bundler.
const isRuntimeModule = (id: string, _importer: string | undefined, isResolved: boolean): boolean =>
  !isResolved && id.startsWith("/");

// A relative import between source files is rewritten to its absolute resource
// path ("./actions" in lib/turbo-streams/index.ts becomes
// "/lib/turbo-streams/actions") and left to the runtime. Rolldown would otherwise
// rewrite a relative external against the output root, and get it wrong.
const SRC_DIR = resolve(SRC);
const relativeSourceImports = {
  name: "relative-source-imports",
  resolveId(id: string, importer: string | undefined) {
    if (!id.startsWith(".") || !importer?.startsWith(`${SRC_DIR}${sep}`)) {
      return null;
    }
    const path = relative(SRC_DIR, resolve(dirname(importer), id)).replaceAll(sep, "/");
    return { id: `/${path}`, external: "absolute" as const };
  },
};

// Nashorn (XP's server-side JS engine) lacks ES2015 destructuring, but Oxc —
// tsdown's transformer — can't target below es2015. Re-lower the bundled server
// output to es5 with SWC after bundling, so bundled deps are covered too. SWC
// does all the lowering: Oxc's own down-level helpers call ES2016+ APIs (e.g.
// Array#includes for object rest) that Nashorn lacks.
const nashornEs5 = {
  name: "nashorn-es5",
  async renderChunk(code: string) {
    const out = await transform(code, {
      jsc: {
        parser: { syntax: "ecmascript" },
        target: "es5",
        loose: true,
        externalHelpers: false,
      },
      isModule: false,
      minify: false,
      sourceMaps: false,
    });
    return { code: out.code, map: null };
  },
};

// One build per source file: with a single entry, Rolldown has nothing to share
// between entries, so it never extracts chunks (e.g. Oxc's runtime helpers like
// _objectSpread2). The helpers are inlined into each file that needs them, which
// makes the output easier to debug. No entries means no builds.
export default defineConfig(
  Object.entries(serverEntry).map(([name, file]) => ({
    entry: { [name]: file },
    outDir: DST,
    format: "cjs" as const,
    target: "esnext", // No lowering by Oxc; nashornEs5 plugin lowers to es5 for Nashorn
    platform: "neutral" as const,
    clean: false, // outDir also holds resources copied there by Gradle
    dts: false, // d.ts files are useless at runtime
    minify: false, // minifying server files makes debugging harder
    sourcemap: false,
    logLevel,
    plugins: [relativeSourceImports, nashornEs5],
    tsconfig: `${SRC}/tsconfig.json`,
    inputOptions: {
      external: isRuntimeModule,
      resolve: {
        mainFields: ["module", "main"],
      },
    },
  })),
);
