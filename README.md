# Enonic XP Turbo Library

Enonic XP Library for integrating with [Turbo Streams](https://turbo.hotwire.dev/reference/streams).

[![](https://jitpack.io/v/no.item/lib-xp-turbo.svg)](https://jitpack.io/#no.item/lib-xp-turbo)

<img src="https://github.com/ItemConsulting/lib-xp-turbo/raw/main/docs/icon.svg?sanitize=true" width="150">

## Gradle

To install this library you may need to add some new dependencies to your app's build.gradle file.

```groovy
repositories {
  maven { url 'https://jitpack.io' }
}

dependencies {
  include "com.enonic.xp:lib-portal:${xpVersion}"
  include "com.enonic.xp:lib-websocket:${xpVersion}"
  include 'no.item:lib-xp-turbo:1.1.0'
  webjar "org.webjars.npm:hotwired__turbo:8.0.5"
}
```

### TypeScript

You can add the following changes to your *tsconfig.json* to get TypeScript-support.

```diff
{
  "compilerOptions": {
+   "baseUrl": "./",
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
 2. Set the `"turbo-streams"` service to be the `<turbo-stream-source>` of the page. (Has to be in `<body>`).

```html
<head>
  <!-- 1. Imported as a webjar (see above) -->
  <script type="module" src="[@assetUrl path='hotwired__turbo/8.0.5/dist/turbo.es2017-esm.js'/]"></script>
</head>
<body>
  <!-- 2. -->
  <turbo-stream-source src="[@serviceUrl service='turbo-streams' type='websocket'/]"></turbo-stream-source>
</body>
```

## Usage

You can now directly manipulate the dom from serverside JavaScript over websocket, using following functions:
 - `append({ target, content });`
 - `prepend({ target, content });`
 - `replace({ target, content });`
 - `update({ target, content });`
 - `remove({ target });`
 - `before({ target, content });`
 - `after({ target, content });`
 - `refresh({ requestId });`

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

// Initiates a Page Refresh to render new content with morphing.
turboStreamsLib.after({
  requestId: 'my-refresh-id',
});
```

## Selecting web sockets

### Default setup

If you use the default setup – like specified above – you **don't** have to specify `socketId` or `groupId` at all.

If you used the page contribution from `getTurboStreamPageContribution()` a web socket connections was initialized against
the `"turbo-streams"` *service*. The service registered the socket with a *websocket group* based on the users session id.

It is this group – based on the user's session id – that is the default receiver of messages from `append`, `prepend`,
`replace`, `update` and `remove`.

### Send to all users' browser at same time

If you want to send a message to every browser connected to the `"turbo-streams"` *service*. You can use the default
group with the id specified in the constant `DEFAULT_GROUP_ID`:

```javascript
turboStreamsLib.append({
  target: 'my-special-id',
  content: '<div role="alert">Hello</div>',
  groupId: turboStreamsLib.DEFAULT_GROUP_ID
});
```

### Send to specific socket

If you know the `socketId` of a websocket (you get it from `event.session.id` in `webSocketEvent()`), you can use it as
the channel for messages from this library.

```javascript
turboStreamsLib.append({
  target: 'my-special-id',
  content: '<div role="alert">Hello</div>',
  socketId: mySocketId
});
```

### Send to specific web socket group

If you want to send messages to a websocket group of your choice you can use `groupId` to specify it. To register new
groups you need to create your own *service* that exposes your own socket, instead of using the built in service
named `"turbo-streams"`.

```javascript
turboStreamsLib.append({
  target: 'my-special-id',
  content: '<div role="alert">Hello</div>',
  groupId: myGroupId
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

You need to configure your *site.xml* with the following:

```diff
<?xml version="1.0" encoding="UTF-8"?>
<site>
+ <processors>
+   <response-processor name="turbo-streams" order="10" />
+ </processors>
</site>
```

> [!NOTE]
> Behind the scenes, a header field `"x-turbo"` is used to pass the response body from the part to the response processor

## Development

### Changesets

[Changesets](https://changesets-docs.vercel.app/) is a tool that helps developers version the software, and create
changelogs.

Please include Changesets in your PRs.

To install Changesets run the following command:

```bash
npm install -g @changesets/cli
```


Run the following command and you will be prompted to create a changelog message and tell it which level to bump the next version:

```bash
changeset
```

### Building

To build he project run the following command:

```bash
./gradlew build
```

### Deploy locally

Deploy locally for testing purposes:

```bash
./gradlew publishToMavenLocal
```
## Deploy to Jitpack

Go to the [Jitpack page for lib-xp-turbo](https://jitpack.io/#no.item/lib-xp-turbo) to deploy from Github (after
[creating a new versioned release](https://github.com/ItemConsulting/lib-xp-turbo/releases/new)).
