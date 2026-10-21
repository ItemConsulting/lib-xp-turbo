---
"@item-enonic-types/lib-turbo-streams": major
---

Replace `createTurboStreamResponse()` with `setTurboStreamHTTPResponse()`. The hack using the `x-tmp-turbo` header has been removed.

`MIME_TYPE_TURBO_STREAMS` is now the bare mime type `"text/vnd.turbo-stream.html"`, without `; charset=utf-8`. Use the new `CONTENT_TYPE_TURBO_STREAMS` (`"text/vnd.turbo-stream.html; charset=utf-8"`) as the `contentType` of a response.
