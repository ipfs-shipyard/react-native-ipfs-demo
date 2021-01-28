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

If you need to change the input URLs for the HTTP client factory on both Android and iOS, you can do so by editing [config.js](src/config.js) file.

Feel free to tweak the parameters (CIDs, multiaddr, etc.) for each HTTP client method by editing the corresponding code in each [screen](src/screens).
## Requirements to use HTTP client

- [react-native-polyfill-globals](https://github.com/acostalima/react-native-polyfill-globals) - Polyfills and patches missing or partially supported web and core APIs.
- [react-native-fetch-api](https://github.com/react-native-community/fetch) - A fetch API polyfill for React Native with text streaming support built on top of React Native's [Networking API](https://github.com/facebook/react-native/blob/v0.63.4/Libraries/Network).
- [@babel/plugin-proposal-async-generator-functions](https://github.com/babel/babel/tree/master/packages/babel-plugin-proposal-async-generator-functions)

The environment must be [polyfilled](shims/index.js) right when your app starts and before anything is rendered.

### Alternative fetch polyfill

Instead of using the fetch implementation that [ships](https://github.com/facebook/react-native/blob/v0.63.4/Libraries/Network/fetch.js) with React Native, which is provided by [GitHub's fetch polyfill](https://github.com/github/fetch), this demo is now using `react-native-fetch-api`. It implements `Response.body` to add support for text streaming via native incremental data events.

## Known issues and limitations

- It's not possible to create `Blob`s from `ArrayBuffer`s and `ArrayBufferView`s.
    - Source: https://github.com/facebook/react-native/blob/v0.63.4/Libraries/Blob/BlobManager.js#L75. 
- In debug mode, an error screen is always displayed every time `console.error` or `console.error` functions are called.
    - Track: https://github.com/facebook/react-native/issues/30378
- Support for missing core functionality or features required by the HTTP client to operate is added by [react-native-polyfill-globals](https://github.com/acostalima/react-native-polyfill-globals). Confer the [patch](https://github.com/acostalima/react-native-polyfill-globals/blob/master/patches/react-native%2B0.63.3.patch) file.

