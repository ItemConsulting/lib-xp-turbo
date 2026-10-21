// Module resolver for `node --test`. XP resolves absolute specifiers like "/lib/turbo-streams" against the
// app's own resources, and "/lib/xp/*" against its own libraries; the test runner needs the same
// mapping. "/lib/xp/*" are Java-backed with no Node implementation, so they map to stubs.
//
// The stubs keep state (context attributes, recorded calls) at module level. To give each test a fresh
// copy, a test imports "/lib/turbo-streams?fresh=<n>": the query is kept on the resolved URL, which makes
// Node load a new instance, and it is passed on to everything the instance imports, so the whole module
// graph (including the stubs) is fresh and consistent. Registered with module.registerHooks() from
// register.mjs, which runs the hook synchronously in the same thread, so it must not be async.
import { existsSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RESOURCES = `${pathToFileURL(resolvePath(process.cwd(), "src/main/resources")).href}/`;
const STUBS = `${pathToFileURL(resolvePath(process.cwd(), "src/test/stubs")).href}/`;

export function resolve(specifier, context, next) {
  const [bare, query = ""] = specifier.split("?");
  const url = map(bare, context.parentURL);

  if (url) {
    return { url: url + (query ? `?${query}` : freshQuery(context.parentURL)), shortCircuit: true };
  }

  return next(specifier, context);
}

function map(specifier, parentURL) {
  if (specifier.startsWith("/lib/xp/")) {
    return `${STUBS}lib-xp-${specifier.slice("/lib/xp/".length)}.mts`;
  }
  // Other absolute specifiers are source files of the library, as a file or a folder with an index
  if (specifier.startsWith("/")) {
    return sourceFile(new URL(specifier.slice(1), RESOURCES).href);
  }
  // The modules of the library import each other relatively and without extension, which tsdown
  // resolves at build time. Node needs the extension.
  if (/^\.\.?\//.test(specifier) && parentURL?.startsWith(RESOURCES) && !/\.[cm]?[jt]s$/.test(specifier)) {
    return sourceFile(new URL(specifier, parentURL).href);
  }
  return undefined;
}

function sourceFile(url) {
  return [`${url}.ts`, `${url}/index.ts`].find((candidate) => existsSync(fileURLToPath(candidate)));
}

function freshQuery(parentURL) {
  if (parentURL?.startsWith(RESOURCES) || parentURL?.startsWith(STUBS)) {
    return new URL(parentURL).search;
  }
  return "";
}
