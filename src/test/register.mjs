// Loaded via `node --import` before any test. Registers the module resolver and installs the globals
// Enonic XP provides to every module: `app`, `log` and `__`.
import { registerHooks } from "node:module";
import { resolve } from "./loader.mjs";

registerHooks({ resolve });

globalThis.app = {
  name: "com.example.app",
  version: "1.0.0",
  config: {},
};

globalThis.log = {
  debug: () => undefined,
  info: (...args) => console.info(...args),
  error: (...args) => console.error(...args),
  warning: (...args) => console.warn(...args),
};

// `__.newBean()` creates a Java bean. The only bean of the library is no.item.xp.turbo.SessionBean, which
// returns the id of the user's session.
globalThis.__ = {
  newBean: () => ({
    getId: () => "session-1",
  }),
};
