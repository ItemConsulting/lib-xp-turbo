import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Response } from "@enonic-types/core";
import { load, request } from "./helpers.mts";

const page: Response = {
  status: 200,
  body: "<html></html>",
  contentType: "text/html",
  headers: { "x-custom": "kept" },
};

describe("turbo-streams response processor", () => {
  it("replaces the body with the Turbo Stream set by a part", async () => {
    const { turbo, processor } = await load();
    turbo.setTurboStreamHTTPResponse({ action: "remove", target: "id" });

    assert.deepEqual(processor.responseProcessor(request(), page), {
      status: 200,
      body: `<turbo-stream action="remove" target="id"></turbo-stream>`,
      contentType: "text/vnd.turbo-stream.html; charset=utf-8",
      headers: { "x-custom": "kept" },
    });
  });

  it("returns the response unchanged when no part set a Turbo Stream", async () => {
    const { processor } = await load();

    assert.equal(processor.responseProcessor(request(), page), page);
  });

  it("returns an empty Turbo Stream, instead of the page", async () => {
    const { turbo, processor } = await load();
    turbo.setTurboStreamHTTPResponse([]);

    const res = processor.responseProcessor(request(), page);

    assert.equal(res.body, "");
    assert.equal(res.contentType, "text/vnd.turbo-stream.html; charset=utf-8");
  });

  it("only uses the Turbo Stream once", async () => {
    const { turbo, processor } = await load();
    turbo.setTurboStreamHTTPResponse({ action: "remove", target: "id" });

    processor.responseProcessor(request(), page);

    assert.equal(processor.responseProcessor(request(), page), page);
  });
});
