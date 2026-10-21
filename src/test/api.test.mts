import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SseEvent } from "@enonic-types/core";
import { calls, load, request } from "./helpers.mts";

const EVENT_STREAM = { Accept: "text/event-stream" };

type Attributes = { usersPersonalGroupName: string; group: string | undefined };

function sseEvent(type: SseEvent["type"], attributes?: Attributes): SseEvent<Attributes> {
  return { type, clientId: "client-1", attributes } as SseEvent<Attributes>;
}

describe("turbo-streams API", () => {
  it("answers requests that do not accept an event stream with 406", async () => {
    const { api } = await load();

    assert.deepEqual(api.GET(request({ Accept: "text/html" })), { status: 406 });
  });

  it("opens a stream, with the user's personal group as attribute", async () => {
    const { api } = await load();

    assert.deepEqual(api.GET(request(EVENT_STREAM)), {
      sse: {
        attributes: { usersPersonalGroupName: "turbo-streams-session-1", group: undefined },
      },
    });
  });

  it("adds the group from the query parameters", async () => {
    const { api } = await load();

    assert.deepEqual(api.GET(request(EVENT_STREAM, { group: "comments" })), {
      sse: {
        attributes: { usersPersonalGroupName: "turbo-streams-session-1", group: "comments" },
      },
    });
  });

  it("uses the first group when the query parameter is repeated", async () => {
    const { api } = await load();

    const res = api.GET(request(EVENT_STREAM, { group: ["first", "second"] }));

    assert.equal("sse" in res ? res.sse?.attributes?.group : undefined, "first");
  });

  it("joins the personal, default and requested groups when the stream opens", async () => {
    const { api, sse } = await load();

    api.sseEvent(sseEvent("open", { usersPersonalGroupName: "turbo-streams-session-1", group: "comments" }));

    assert.deepEqual(calls(sse.addToGroup), [
      [{ group: "turbo-streams-session-1", clientId: "client-1" }],
      [{ group: "turbo-streams", clientId: "client-1" }],
      [{ group: "comments", clientId: "client-1" }],
    ]);
  });

  it("joins only the personal and default groups when no group was requested", async () => {
    const { api, sse } = await load();

    api.sseEvent(sseEvent("open", { usersPersonalGroupName: "turbo-streams-session-1", group: undefined }));

    assert.deepEqual(
      calls(sse.addToGroup).map(([params]) => (params as { group: string }).group),
      ["turbo-streams-session-1", "turbo-streams"],
    );
  });

  it("does nothing on the other stream events", async () => {
    const { api, sse } = await load();
    const attributes = { usersPersonalGroupName: "turbo-streams-session-1", group: undefined };

    api.sseEvent(sseEvent("close", attributes));
    api.sseEvent(sseEvent("timeout", attributes));
    api.sseEvent(sseEvent("error", attributes));

    assert.equal(sse.addToGroup.mock.callCount(), 0);
  });
});
