---
"@item-enonic-types/lib-turbo-streams": patch
---

Fix 500 error when opening a stream without the `group` query parameter. The SSE attribute is now only set when a group is given.
