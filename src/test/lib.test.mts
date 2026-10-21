import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calls, load, request } from "./helpers.mts";

const TURBO_ACCEPT = "text/vnd.turbo-stream.html, text/html, application/xhtml+xml";

describe("constants", () => {
  it("has the mime type without, and the content type with charset", async () => {
    const { turbo } = await load();

    assert.equal(turbo.MIME_TYPE_TURBO_STREAMS, "text/vnd.turbo-stream.html");
    assert.equal(turbo.CONTENT_TYPE_TURBO_STREAMS, "text/vnd.turbo-stream.html; charset=utf-8");
  });
});

describe("acceptTurboStreams", () => {
  it("accepts the Accept header Turbo sends when it submits a form", async () => {
    const { turbo } = await load();

    assert.equal(turbo.acceptTurboStreams(request({ Accept: TURBO_ACCEPT })), true);
  });

  it("reads the header case-insensitively, since HTTP/2 lowercases header names", async () => {
    const { turbo } = await load();

    assert.equal(turbo.acceptTurboStreams(request({ accept: TURBO_ACCEPT })), true);
  });

  it("rejects requests that do not accept Turbo Streams", async () => {
    const { turbo } = await load();

    assert.equal(turbo.acceptTurboStreams(request({ Accept: "text/html" })), false);
    assert.equal(turbo.acceptTurboStreams(request()), false);
  });
});

describe("Turbo Streams over HTTP", () => {
  it("returns the actions set by setTurboStreamHTTPResponse(), serialized", async () => {
    const { turbo } = await load();

    turbo.setTurboStreamHTTPResponse({ action: "remove", target: "id" });

    assert.equal(turbo.consumeTurboStreamHTTPResponse(), `<turbo-stream action="remove" target="id"></turbo-stream>`);
  });

  it("clears the Turbo Stream once it has been consumed", async () => {
    const { turbo } = await load();
    turbo.setTurboStreamHTTPResponse({ action: "remove", target: "id" });

    turbo.consumeTurboStreamHTTPResponse();

    assert.equal(turbo.consumeTurboStreamHTTPResponse(), undefined);
  });

  it("returns undefined when no Turbo Stream has been set", async () => {
    const { turbo } = await load();

    assert.equal(turbo.consumeTurboStreamHTTPResponse(), undefined);
  });

  it("returns an empty string for an empty list of actions", async () => {
    const { turbo } = await load();
    turbo.setTurboStreamHTTPResponse([]);

    assert.equal(turbo.consumeTurboStreamHTTPResponse(), "");
  });
});

describe("Turbo Streams over SSE", () => {
  it("sends to the user's personal group by default", async () => {
    const { turbo, sse } = await load();

    turbo.append({ target: "list", content: "<li>One</li>" });

    assert.deepEqual(calls(sse.sendToGroup), [
      [
        {
          group: "turbo-streams-session-1",
          message: {
            data: `<turbo-stream action="append" target="list">
  <template>
    <li>One</li>
  </template>
</turbo-stream>`,
          },
        },
      ],
    ]);
  });

  it("sends to the given group, and leaves group out of the action", async () => {
    const { turbo, sse } = await load();

    turbo.remove({ target: "id", group: "my-group" });

    assert.deepEqual(calls(sse.sendToGroup), [
      [{ group: "my-group", message: { data: `<turbo-stream action="remove" target="id"></turbo-stream>` } }],
    ]);
  });

  it("sends each action function as its own action", async () => {
    const { turbo, sse } = await load();

    turbo.append({ target: "id", content: "" });
    turbo.prepend({ target: "id", content: "" });
    turbo.replace({ target: "id", content: "" });
    turbo.update({ target: "id", content: "" });
    turbo.before({ target: "id", content: "" });
    turbo.after({ target: "id", content: "" });
    turbo.remove({ target: "id" });
    turbo.refresh({});

    const actions = calls(sse.sendToGroup).map(
      ([params]) => /action="([a-z]+)"/.exec((params as { message: { data: string } }).message.data)?.[1],
    );
    assert.deepEqual(actions, ["append", "prepend", "replace", "update", "before", "after", "remove", "refresh"]);
  });

  it("names the personal group after the user's session", async () => {
    const { turbo } = await load();

    assert.equal(turbo.getUsersPersonalGroupName(), "turbo-streams-session-1");
  });
});
