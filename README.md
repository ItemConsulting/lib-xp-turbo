# Enonic XP Turbo Library

Enonic XP Library for integrating with [Turbo Streams](https://turbo.hotwire.dev/reference/streams).

[![](https://repo.itemtest.no/api/badge/latest/snapshots/no/item/lib-xp-turbo)](https://repo.itemtest.no/#/snapshots/no/item/lib-xp-turbo)
![Enonic XP8 badge](https://market.enonic.com/badges/xp8.svg)
[![](https://img.shields.io/npm/types/%40item-enonic-types%2Flib-turbo-streams)](https://www.npmjs.com/package/@item-enonic-types/lib-turbo-streams)


<img src="https://github.com/ItemConsulting/lib-xp-turbo/raw/main/docs/icon.svg?sanitize=true" width="150">

## Setup

Add `"turbo-streams"` to your *cms/site.yaml* to expose the API on your site:

```diff
kind: "Site"
+ apis:
+   - "turbo-streams"
```

## Gradle

Version 2 of this library requires Enonic XP 8, and is built against XP 8.1.0-B3. Use version 1.x for Enonic XP 7.

To install this library you may need to add some new dependencies to your app's build.gradle file.

```groovy
repositories {
  maven { url "https://repo.itemtest.no/releases" }
}

dependencies {
  include "no.item:lib-xp-turbo:2.0.0"
  webjar "org.webjars.npm:hotwired__turbo:8.0.23"
}
```

The library depends on `lib-sse`, which your app picks up transitively. Webjars are not included transitively, so the
Turbo webjar has to be added to your app.

### TypeScript

You can add the following changes to your *tsconfig.json* to get TypeScript-support. Leave out `baseUrl`: TypeScript 7
no longer supports it, and `paths` resolve relative to the *tsconfig.json* file without it.

```diff
{
  "compilerOptions": {
+   "paths": {
+     "/lib/xp/*": ["./node_modules/@enonic-types/lib-*"],
+     "/lib/*": [ "./node_modules/@item-enonic-types/lib-*" ,"./src/main/resources/lib/*"],
+   }
  }
}
```

## Setup

### Page template

> [!CAUTION]
> Including the *turbo.es2017-esm.js* file will affect the basic functionality of your page (like navigation).
> Read the [Turbo documentation](https://turbo.hotwire.dev/handbook/introduction) to make sure that this is something you
> want to do.


 1. Import the turbo script in your page html (has to be in `<head>`).
 2. Set the `"turbo-streams"` API to be the `<turbo-stream-source>` of the page. (Has to be in `<body>`).

Pass the stream url from your page controller to the template:

```typescript
import { assetUrl } from "/lib/enonic/asset";
import { apiUrl } from "/lib/xp/portal";
import { render } from "/lib/freemarker";
import { API_TURBO_STREAMS } from "/lib/turbo-streams";
import type { Response } from "@enonic-types/core";

const view = resolve("my-view.ftlh");

export function get(): Response {
  const model = {
    assetUrlBase: assetUrl({
      path: ""
    }),
    turboStreamsUrl: apiUrl({
      api: API_TURBO_STREAMS,
    })
  };
  
  return {
    body: render(view, model)
  }
}
```

```ftlh
<head>
  <!-- 1. Imported as a webjar (see above) -->
  <script type="module" src="${assetUrlBase}/hotwired__turbo/8.0.23/dist/turbo.es2017-esm.js"></script>
</head>
<body>
  <!-- 2. -->
  <turbo-stream-source src="${turboStreamsUrl}"></turbo-stream-source>
</body>
```

Turbo opens an [`EventSource`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) against the url, and the
`"turbo-streams"` API keeps the connection open as a stream of
[server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

### Connections and HTTP/1.1

Every page with a `<turbo-stream-source>` holds one long-lived HTTP connection open for as long as the page is open.

> [!WARNING]
> Over HTTP/1.1, browsers allow only about **6 open connections per domain**, shared by every tab. Each open
> stream uses one of them for as long as the page is open, so a user with around 6 tabs open against the same site
> will have regular page loads, assets and form posts stall, waiting for a free connection.
>
> Serve the site over **HTTP/2** (or HTTP/3) in production. It sends all requests over a single connection, which
> removes the limit in practice. This is usually enabled on the reverse proxy or load balancer in front of Enonic XP.
>
> Local development against `http://localhost:8080` runs over HTTP/1.1, so you can hit the limit there with many tabs
> open.

Other things to be aware of:

- **Idle connections are closed.** Enonic XP closes a connection with no traffic after 60 seconds by default (`timeout`
  in *com.enonic.xp.web.jetty.cfg*), and proxies often have similar limits. The browser reconnects automatically, but
  messages sent while a stream is reconnecting are lost.
- **Proxies must not buffer the stream.** A proxy that buffers or compresses responses holds events back until the
  buffer fills. For nginx, turn off `proxy_buffering` for the API path (or send `X-Accel-Buffering: no`).

## Usage

You can now directly manipulate the dom from serverside JavaScript over server-sent events, using following functions:
 - `append({ target, content });`
 - `prepend({ target, content });`
 - `replace({ target, content, method });`
 - `update({ target, content, method });`
 - `remove({ target });`
 - `before({ target, content });`
 - `after({ target, content });`
 - `refresh({ requestId, method, scroll });`

Every function also takes an optional `group`, see [Selecting streams](#selecting-streams).

Use `targets` with a CSS selector instead of `target` to update several elements at once. `method: "morph"` on `replace`
and `update` morphs the existing dom instead of replacing it, which keeps state like focus and scroll position. On
`refresh`, `method` (`"morph"` or `"replace"`) and `scroll` (`"preserve"` or `"reset"`) override the page's
`turbo-refresh-method` and `turbo-refresh-scroll` meta tags, and need Turbo 8.0.21 or newer.

### Example

```javascript
var turboStreamsLib = require('/lib/turbo-streams');

// Append some markup to a target id in the dom
turboStreamsLib.append({
  target: 'my-alert-wrapper-id',
  content: '<div role="alert">Something went wrong</div>'
});

// Prepend some markup to a target id in the dom
turboStreamsLib.prepend({
  target: 'my-alert-wrapper-id',
  content: '<div role="alert">Something else went wrong</div>'
});

// Replace some markup at a target id in the dom
turboStreamsLib.replace({
  target: 'status-id',
  content: '<div id="status-id">Status has changed</div>'
});

// Update the contents inside at a target id in the dom
turboStreamsLib.update({
  target: 'status-id',
  content: 'Status has changed again!'
});

// Remove an element with a target id from the dom
turboStreamsLib.remove({
  target: 'status-id'
});

// Insert some markup before a target id in the dom
turboStreamsLib.before({
  target: 'my-alert-id',
  content: '<div role="alert">Something else went wrong</div>'
});

// Insert some markup after a target id in the dom
turboStreamsLib.after({
  target: 'my-alert-id',
  content: '<div role="alert">Something else went wrong</div>'
});

// Morph the element instead of replacing it
turboStreamsLib.replace({
  target: 'status-id',
  content: '<div id="status-id">Status has changed</div>',
  method: 'morph'
});

// Initiates a Page Refresh to render new content with morphing.
turboStreamsLib.refresh({
  requestId: 'my-refresh-id',
  method: 'morph',
  scroll: 'preserve'
});
```

### Send any action

`sendBySSE()` sends a Turbo Stream action where the action is a parameter. It is useful when the action is decided at
runtime:

```javascript
turboStreamsLib.sendBySSE({
  action: 'append',
  target: 'my-alert-wrapper-id',
  content: '<div role="alert">Something went wrong</div>',
  group: turboStreamsLib.DEFAULT_GROUP_ID // optional
});
```

## Selecting streams

### Default setup

If you use the default setup – like specified above – you **don't** have to specify `group` at all.

The `<turbo-stream-source>` opens a stream against the `"turbo-streams"` *API*. The API registers the stream with an
*SSE group* based on the user's session id.

It is this group – based on the user's session id – that is the default receiver of messages from `append`, `prepend`,
`replace`, `update`, `remove`, `before`, `after` and `refresh`.

### Send to all users' browser at same time

If you want to send a message to every browser connected to the `"turbo-streams"` *API*. You can use the default
group with the id specified in the constant `DEFAULT_GROUP_ID`:

```javascript
turboStreamsLib.append({
  target: 'my-special-id',
  content: '<div role="alert">Hello</div>',
  group: turboStreamsLib.DEFAULT_GROUP_ID
});
```

### Send to specific group

A stream can join one extra group of your choice. Pass its name as the `group` query parameter when creating the stream
url:

```typescript
const model = {
  turboStreamsUrl: apiUrl({
    api: API_TURBO_STREAMS,
    params: {
      group: "my-group-id",
    },
  })
};
```

> [!CAUTION]
> The group name is a plain query parameter, so anyone can open a stream that joins any group they can guess. Don't
> send content that is private to a user or role to a custom group. Use the default, session-based group for that.

Then use `group` to send messages to every stream in that group:

```javascript
turboStreamsLib.append({
  target: 'my-special-id',
  content: '<div role="alert">Hello</div>',
  group: 'my-group-id'
});
```

### Turbo Streams over HTTP

It is also possible to return turbo streams over http with the `Content-Type` `"text/vnd.turbo-stream.html; charset=utf-8"`.

This can for instance be returned by a form submission to perform multiple actions the web page's dom.

Use the `acceptTurboStreams()` to check if Turbo Streams is supported. Then use `serialize()` to transform
an `Array` of `{ action, target, content }` to a `string` with Turbo Stream actions.

```javascript
var turboStreamsLib = require('/lib/turbo-streams');

exports.post = function(req) {
  // if "Accept" header includes mime type
  if (turboStreamsLib.acceptTurboStreams(req)) {
    return turboStreamsLib.createTurboStreamResponse([
      {
        action: 'append',
        target: 'my-alert-wrapper-id',
        content: '<div role="alert">Something went wrong</div>'
      },
      {
        action: 'replace',
        target: 'status-id',
        content: '<div>Status has changed</div>'
      }
    ]);
  } else {
    return {
      status: 200,
      body: "This page doesn't accept Turbo Streams"
    };
  }
}
```

Use the "turbo-streams" [response processor](https://developer.enonic.com/docs/xp/stable/cms/response-processors) 
– included in this library – to make the response body from a *part* become the whole payload returned to the browser.

You need to configure your *cms/site.yaml* with the following:

```diff
kind: "Site"
+ processors:
+   - name: "turbo-streams"
+     order: 10
```

> [!NOTE]
> Behind the scenes, a header field `"x-tmp-turbo"` is used to pass the response body from the part to the response processor

## Development

### Changesets

[Changesets](https://changesets-docs.vercel.app/) is a tool that helps developers version the software, and create
changelogs.

Please include Changesets in your PRs.

Run the following command and you will be prompted to create a changelog message and tell it which level to bump the next version:

```bash
npx changeset
```

### Building

Building requires Java 25 (Enonic XP 8 compiles against Java 25, and the Gradle settings plugin needs Java 21 or newer
to run). To build the project run the following command:

```bash
./gradlew build
```

This runs [Biome](https://biomejs.dev/) and the TypeScript type check, compiles the Java sources, bundles the TypeScript
with [tsdown](https://tsdown.dev/) and builds the jar. The checks can also be run on their own:

```bash
npm run check     # Biome + TypeScript type check
npm run lint:fix  # Apply Biome's formatting and safe fixes
```

### Deploy locally

Deploy locally for testing purposes:

```bash
./gradlew publishToMavenLocal
```

### Releasing

Releases are published by the *Publish* GitHub Actions workflow. When changesets are merged to `main`, it opens a
"Version Packages" pull request. Merging that pull request publishes the type definitions to npm and the jar to
[repo.itemtest.no](https://repo.itemtest.no).
