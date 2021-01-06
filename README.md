# Enonic XP Turbo Library

Enonic XP Library for integrating with Turbo streams.

[ ![Download](https://api.bintray.com/packages/itemconsulting/public/no.item.xp.lib-xp-turbo/images/download.svg?version=1.0.0) ](https://bintray.com/itemconsulting/public/no.item.xp.lib-xp-turbo/1.0.0/link)

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

## Usage

```typescript
var turboLib = __non_webpack_require__('/lib/turbo-streams');

turboLib.append({
  target: 'my-alert-wrapper-id', 
  content: '<div role="alert">Something went wrong</div>'
});

turboLib.prepend({
  target: 'my-alert-wrapper-id', 
  content: '<div role="alert">Something else went wrong</div>'
});

turboLib.replace({
  target: 'status-id', 
  content: '<div>Status has changed</div>'
});

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
