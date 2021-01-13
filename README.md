# Enonic XP Turbo Library

Enonic XP Library for integrating with [Turbo Streams](https://turbo.hotwire.dev/reference/streams).

[ ![Download](https://api.bintray.com/packages/itemconsulting/public/no.item.xp.lib-xp-turbo/images/download.svg?version=1.0.0) ](https://bintray.com/itemconsulting/public/no.item.xp.lib-xp-turbo/1.0.0/link)


<img src="https://github.com/ItemConsulting/lib-xp-turbo/raw/main/docs/icon.svg?sanitize=true" width="150">

## Gradle

To install this library you may need to add some new dependencies to your app's build.gradle file.

```groovy
repositories {
  maven {
    url  "http://itemconsulting.bintray.com/public"
  }
}

dependencies {
  include "com.enonic.xp:lib-portal:${xpVersion}"
  include "com.enonic.xp:lib-websocket:${xpVersion}"
  include 'no.item.xp:lib-xp-turbo:1.0.0'
  webjar "org.webjars.npm:hotwired__turbo:7.0.0-beta.3"
}
```

## Setup

### Page template

**Warning:** Including the *turbo.es5-umd.min.js* file will affect the basic functionality of your page (like navigation). 
Read the [Turbo documentation](https://turbo.hotwire.dev/handbook/introduction) to make sure that this is something you 
want to do.

 1. You need to place the  `turboStreamUrl` JavaScript variable on the *global scope* so that the initialization script 
    has access to it.
 2. Import the turbo script in your page html (has to be in `<head>`).
 3. A simple [initialization script](./src/main/resources/assets/init-turbo-streams.js) is included with this library. 
    Note that this JavaScript code can't be inlined, but needs to be included as a script file because of how Turbo works.

```html  
<head>
  <!-- 1. -->
  <script data-th-inline="javascript">
    var turboStreamUrl = /*[[${turboStreamUrl}]]*/ undefined;
  </script>
  
  <!-- 2. Imported as a webjar (see above) -->
  <script
    data-th-src="${portal.assetUrl({'_path=hotwired__turbo/7.0.0-beta.3/dist/turbo.es5-umd.js'})}"
    defer>
  </script>

  <!-- 3. -->
  <script
    data-th-src="${portal.assetUrl({'_path=init-turbo-streams.js'})}"
    defer>
  </script>
</head>
```

### Page controller

You need to provide the template above with the `turboStreamUrl` variable. You can either use `getWebSocketUrl()`
function without parameters, and get the default web socket provided by this library. Or you can use your own 
service like this: `getWebSocketUrl({ service: 'myservice' })`:

```javascript
var turboStreamsLib = require("/lib/turbo-streams");

var view = resolve("mypage.html")

exports.get = function(req) {
  var thymeleafParams = {
    turboStreamUrl: turboStreamsLib.getWebSocketUrl()
  };
  
  return {
    status: 200,
    body: thymeleafLib.render(view, thymeleafParams),
  };
}
```
## Usage

You can now directly manipulate the dom from serverside JavaScript over websocket, using following functions:
 - `append({ target, content });`
 - `prepend({ target, content });`
 - `replace({ target, content });`
 - `remove({ target });`

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
  content: '<div>Status has changed</div>'
});

// Remove an element with a target id from the dom
turboStreamsLib.remove({
  target: 'status-id'
});
```

## Selecting web sockets

### Default setup

If you use the default setup – like specified above – you **don't** have to specify `socketId` or `groupId` at all. 

If you used the page contribution from `getTurboStreamPageContribution()` a web socket connections was initialized against
the `"turbo-streams"` *service*. The service registered the socket with a *websocket group* based on the users session id.

It is this group – based on the user's session id – that is the default receiver of messages from `append`, `prepend`,
`replace` and `remove`.

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

### TypeScript

If you are using TypeScript in your application,
[types](https://github.com/ItemConsulting/enonic-types/blob/main/src/turbo.ts) for this library has been added to the
[*enonic-types*](https://github.com/ItemConsulting/enonic-types) library.

### Building

To build he project run the following code

```bash
./gradlew build
```

### Deploy locally

Deploy locally for testing purposes:

```bash
./gradlew publishToMavenLocal
```
### Deploy to Bintray

Since we should not check secrets into git, first you need to add some parameters to `~/.gradle/gradle.properties` to be
able to publish:

```properties
bintrayUser=myUser
bintrayApiKey=mySecretApiKey
```

Run the following code to deploy a new version of the library to [Bintray](https://bintray.com/itemconsulting).

```bash
./gradlew bintrayUpload
```
