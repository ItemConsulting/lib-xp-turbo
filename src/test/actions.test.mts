import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTurboStreamAction, serialize } from "/lib/turbo-streams/actions";

describe("serialize", () => {
  it("serializes an action with content in a template", () => {
    assert.equal(
      serialize({ action: "append", target: "list", content: "<li>One</li>" }),
      `<turbo-stream action="append" target="list">
  <template>
    <li>One</li>
  </template>
</turbo-stream>`,
    );
  });

  it("serializes every action with content", () => {
    for (const action of ["append", "prepend", "replace", "update", "before", "after"] as const) {
      assert.match(
        serialize({ action, target: "id", content: "x" }),
        new RegExp(`^<turbo-stream action="${action}" target="id">`),
      );
    }
  });

  it("uses targets when target is not set", () => {
    assert.equal(
      serialize({ action: "remove", targets: ".item" }),
      `<turbo-stream action="remove" targets=".item"></turbo-stream>`,
    );
  });

  it("prefers target over targets", () => {
    assert.equal(
      serialize({ action: "remove", target: "one", targets: ".item" }),
      `<turbo-stream action="remove" target="one"></turbo-stream>`,
    );
  });

  it("adds method to replace and update", () => {
    assert.match(
      serialize({ action: "replace", target: "id", content: "x", method: "morph" }),
      /^<turbo-stream action="replace" target="id" method="morph">/,
    );
    assert.match(
      serialize({ action: "update", target: "id", content: "x", method: "morph" }),
      /^<turbo-stream action="update" target="id" method="morph">/,
    );
  });

  it("ignores method on actions that do not support it", () => {
    const action = { action: "append", target: "id", content: "x", method: "morph" } as const;

    assert.match(serialize(action), /^<turbo-stream action="append" target="id">/);
  });

  it("serializes refresh with its optional attributes", () => {
    assert.equal(serialize({ action: "refresh" }), `<turbo-stream action="refresh"></turbo-stream>`);
    assert.equal(
      serialize({ action: "refresh", requestId: "r1", method: "morph", scroll: "preserve" }),
      `<turbo-stream action="refresh" request-id="r1" method="morph" scroll="preserve"></turbo-stream>`,
    );
  });

  it("escapes attribute values", () => {
    assert.equal(
      serialize({ action: "remove", target: `a"><script>&` }),
      `<turbo-stream action="remove" target="a&quot;&gt;&lt;script&gt;&amp;"></turbo-stream>`,
    );
  });

  it("does not escape the content, which is markup", () => {
    assert.match(serialize({ action: "update", target: "id", content: "<b>&amp;</b>" }), /<b>&amp;<\/b>/);
  });

  it("joins several actions with a new line", () => {
    assert.equal(
      serialize([
        { action: "remove", target: "one" },
        { action: "remove", target: "two" },
      ]),
      `<turbo-stream action="remove" target="one"></turbo-stream>
<turbo-stream action="remove" target="two"></turbo-stream>`,
    );
  });

  it("serializes no actions to an empty string", () => {
    assert.equal(serialize([]), "");
  });
});

describe("isTurboStreamAction", () => {
  it("accepts actions with a target", () => {
    assert.equal(isTurboStreamAction({ action: "append", target: "id", content: "" }), true);
    assert.equal(isTurboStreamAction({ action: "remove", target: "id" }), true);
  });

  it("accepts refresh without a target", () => {
    assert.equal(isTurboStreamAction({ action: "refresh" }), true);
  });

  it("rejects unknown actions, missing targets and non-objects", () => {
    assert.equal(isTurboStreamAction({ action: "explode", target: "id" }), false);
    assert.equal(isTurboStreamAction({ action: "append", content: "" }), false);
    assert.equal(isTurboStreamAction(null), false);
    assert.equal(isTurboStreamAction(undefined), false);
  });
});
