# Enonic XP Turbo Library

Enonic XP Library for integrating with Turbo streams.

## Installation  

To install this library you need to add a new dependency to your app's build.gradle file.

### Gradle

```groovy
repositories {
    maven {
      url  "http://itemconsulting.bintray.com/public"
    }
}

dependencies {
    include 'no.item.xp:lib-xp-turbo:1.0.0'
}
```

## Setup

Import the turbo script in your page html (has to be in `<head>`).

```html  
<head>
  <script
    src="https://cdn.jsdelivr.net/npm/@hotwired/turbo@7.0.0-beta.2/dist/turbo.es5-umd.min.js"
    crossorigin="anonymous">
  </script>
</head>
```

Initialize turbo streams to the websocket source for your page, by adding a `pageContribution`.

```javascript
var turboLib = require("/lib/turbo-streams");

exports.get = function(req) {
  return {
    status: 200,
    body: "",
    pageContributions: {
      headEnd: turboLib.getTurboStreamPageContribution()
    }
  };
}
```
## Usage

Use the `append`, `prepend`, `replace` and `remove` functions in your code.

```javascript
var turboLib = require('/lib/turbo-streams');

// Append some markup to a target id in the dom
turboLib.append({
  target: 'my-alert-wrapper-id', 
  content: '<div role="alert">Something went wrong</div>'
});

// Prepend some markup to a target id in the dom
turboLib.prepend({
  target: 'my-alert-wrapper-id', 
  content: '<div role="alert">Something else went wrong</div>'
});

// Replace some markup at a target id in the dom
turboLib.replace({
  target: 'status-id', 
  content: '<div>Status has changed</div>'
});

// Remove an element with a target id from the dom
turboLib.remove({
  target: 'status-id'
});
```

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
