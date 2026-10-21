---
"@item-enonic-types/lib-turbo-streams": patch
---

Fix `acceptTurboStreams()` always returning `false`. It compared the "Accept" header against the mime type including `; charset=utf-8`, which Turbo does not send.
