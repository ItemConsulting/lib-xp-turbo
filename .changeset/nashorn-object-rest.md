---
"@item-enonic-types/lib-turbo-streams": patch
---

Fix `TypeError: e.includes is not a function` when sending Turbo Streams over SSE. Object rest was lowered with a helper calling `Array#includes`, which Nashorn lacks.
