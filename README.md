# IPFS React Native Demo App

This project explores and documents how IPFS' HTTP client can be used in a React Native app targeting Android and iOS platforms.

## Usage

Spawn a local IPFS node with the `daemon` command. The app assumes the HTTP API is exposed at http://localhost:5002.

### Run the app on Android

```sh
$ npm run android:debug
```

```sh
$ npm run android:release
```

In order connect to the IPFS node running on your development machine when running the app on a physical device with USB debugging enabled, run the following command:

```sh
$ adb -s <device name> reverse tcp:5002 tcp:5002
```

To find the device name, run the following `adb` command:

```sh
$ adb devices
```

Sources:

- https://reactnative.dev/docs/running-on-device#method-1-using-adb-reverse-recommended
- https://stackoverflow.com/a/43277765/1694191
- https://stackoverflow.com/a/5806384/1694191

### Run the app on iOS

```sh
npm run ios:debug
```

```sh
npm run ios:release
```

In order connect to the IPFS node running on your development machine when running the app on a physical iPhone, you must use the LAN IP of your machine. Also, note that In order to run the app on a physical iPhone, you must create and setup an Apple Developer Certificate.

### Configuration

You need to change the input URLs for the HTTP client factory on both Android and iOS, you can do so by editing [config.js](#config.js) file.

## Alternative fetch API for React Native (13 November 2020)

Instead of using the fetch implemention that [ships](https://github.com/facebook/react-native/blob/master/Libraries/Network/fetch.js) with React Native, which is provided by [GitHub's fetch polyfill](https://github.com/github/fetch), this demo is now using `@react-native-community/fetch`. It implements `Response.body` to add support for text streaming via native incremental data events.

**NOTE**: The v1.0.0 release of `@react-native-community/fetch` is not yet published.

## Related

- [react-native-polyfill-globals](https://github.com/acostalima/react-native-polyfill-globals) - Polyfills and patches missing or partially supported web and core APIs.
- [@react-native-community/fetch](https://github.com/react-native-community/fetch) - A Fetch API polyfill for React Native with text streaming support built on top of React Native's [Networking API](https://github.com/facebook/react-native/tree/master/Libraries/Network).