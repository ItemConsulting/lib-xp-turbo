import type { Request } from "@enonic-types/core";

let loads = 0;

/**
 * Loads a fresh /lib/turbo-streams, the controllers of the library, and fresh stubs of the Enonic XP
 * libraries, so context attributes and the calls recorded by the stubs do not leak between tests. See
 * loader.mjs for how the query does that.
 */
export async function load() {
  const fresh = `?fresh=${++loads}`;

  return {
    turbo: (await import(`/lib/turbo-streams${fresh}`)) as typeof import("/lib/turbo-streams"),
    processor: (await import(
      `/cms/processors/turbo-streams${fresh}`
    )) as typeof import("/cms/processors/turbo-streams"),
    api: (await import(
      `/apis/turbo-streams/turbo-streams${fresh}`
    )) as typeof import("/apis/turbo-streams/turbo-streams"),
    sse: (await import(`/lib/xp/sse${fresh}`)) as typeof import("/lib/xp/sse"),
  };
}

/**
 * A request with the given headers. Like Enonic XP, getHeader() looks the header up case-insensitively.
 */
export function request(headers: Record<string, string> = {}, params: Record<string, string | string[]> = {}) {
  return {
    method: "GET",
    headers,
    params,
    getHeader: (name: string) =>
      Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] ?? null,
  } as unknown as Request;
}

/**
 * The arguments of every call of a node:test mock function, in order
 */
export function calls(fn: { mock: { calls: readonly { arguments: unknown[] }[] } }): unknown[][] {
  return fn.mock.calls.map((call) => call.arguments);
}
