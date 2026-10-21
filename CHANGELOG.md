# @item-enonic-types/lib-turbo-streams

## 2.0.0-beta.0

### Major Changes

- 00b40d1: Replace `createTurboStreamResponse()` with `setTurboStreamHTTPResponse()`. The hack using the `x-tmp-turbo` header has been removed.
  
  `MIME_TYPE_TURBO_STREAMS` is now the bare mime type `"text/vnd.turbo-stream.html"`, without `; charset=utf-8`. Use the new `CONTENT_TYPE_TURBO_STREAMS` (`"text/vnd.turbo-stream.html; charset=utf-8"`) as the `contentType` of a response.
- 00b40d1: Stream Turbo Stream actions as server-sent events (SSE) instead of over web sockets. Web socket support is removed.
- 00b40d1: Support Enonic XP 8, and drop support for XP 7.

### Minor Changes

- 00b40d1: Support `method` and `scroll` on `refresh()`, added in Turbo 8.0.21.

### Patch Changes

- 00b40d1: Fix `acceptTurboStreams()` always returning `false`. It compared the "Accept" header against the mime type including `; charset=utf-8`, which Turbo does not send.

## 1.1.2

### Patch Changes

- a952f78: Fixed bug where the header became x-tmp-turbo

## 1.1.1

### Patch Changes

- c8f7897: Remove init script from assets. Use `<turbo-stream-source>` element instead.

## 1.1.0

### Minor Changes

- fc8a100: Add support for `[method="morph"]` for update and replace actions
- 85db4ee: Add Turbo Stream support for Refresh Action
