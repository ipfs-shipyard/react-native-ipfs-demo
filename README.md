# IPFS React Native app

This repository:
- explores how IPFS' HTTP client can be used in a React Native app targeting Android and iOS platforms.
- documents what issues we have been running into while using the API.
- documents the on-going efforts and results of our debugging sessions.
- documents what issues have been fixed so far.
- documents possible strategies to address open issues.

## Usage

Spawn a local IPFS node with the `daemon` command. The app assumes the node is avaiable at http://localhost:5002.

### Run the app on Android

TODO add instructions on how to setup `adb forward` to allow an Android device to connect to localhost.

```sh
npm run start:android:debug
```
```sh
npm run start:android:release
```

### Run the app on iOS

TODO add instructions on how to setup app signing for iOS

```sh
npm run start:ios:debug
```
```sh
npm run start:ios:release
```

## HTTP client

### Factory

The `URL` API needs to be polyfilled otherwise an error is thrown as [many methods](https://github.com/facebook/react-native/blob/cd347a7e0ed29ae1049e041fcb34588e1aac76f9/Libraries/Blob/URL.js#L115) are not implemented in React Native and thus not conformant with the [spec](https://url.spec.whatwg.org). The exact same goes for `URLSearchParams` API as only a [few methods](https://github.com/facebook/react-native/blob/cd347a7e0ed29ae1049e041fcb34588e1aac76f9/Libraries/Blob/URL.js#L56) are implemented as well.

To work around these issues, we used the implementations provided by [`whatwg-url`](https://github.com/jsdom/whatwg-url) polyfill. `whatwg-url` depends on two core Node.js modules, `punycode` and `util`, which are not available in React Native environment. We have shimed them with alternative implementations:

- `util`: https://github.com/browserify/node-util. `whatwg-url` attempts to require `TextEncoder` and `TextDecoder` APIs from `node-util` and if such objects are not found, it fallbacks to `global.TextEncoder` and `global.TextDecoder`. Since `node-util` does not provide encoding APIs as in Node.js, we have to polyfill them with [`text-encoding`](https://github.com/inexorabletash/text-encoding) instead.
- `punycode`: https://github.com/bestiejs/punycode.js

`whatwg-url` also depends on standard built-in objects such as `BigInt` and `SharedArrayBuffer` via [webidl-conversions](https://github.com/jsdom/webidl-conversions) which are not available in React Native as well. While we can [polyfill](https://github.com/peterolson/BigInteger.js) `BigInt`, `SharedArrayBuffer` is little more tricker. If IPFS does not need `SharedArrayBuffer`, we can probably come up with a way to cheat the type checks out by, e.g., using `ArrayBuffer` in its place. Right now we're using [`react-native-url-polyfill`](https://github.com/charpeni/react-native-url-polyfill), which is an optimized URL standard-compliant implementation for React Native based on [`whatwg-url-without-unicode`](https://github.com/charpeni/whatwg-url). However, it comes without Unicode support thus it's more light in size.

Our experience reveals both `whatwg-url` and `react-native-url-polyfill` appear to not be so comformant with the spec as they claim to be. When the `base` argument of the `URL` constructor is an empty string and the `url` argument is an absolute URL, the constructor is throwing an [error](https://github.com/charpeni/whatwg-url/blob/f934c822a2598ecef25ca7b224e96c29f7e52c65/lib/URL-impl.js#L15) indicating `base` is invalid. As per spec, when `url` is absolute the provided `base` should be ignored. However, it is not implemented this way.

Another issue we detected concerns the [normalization logic](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/core.js#L21) for the input options of the IPFS HTTP client factory. It seems there is a case where `options` is a boxed string and an error is thrown by the `URL` [constructor](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/core.js#L28) because `options.url` is undefined.

### [ipfs.id](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/MISCELLANEOUS.md#ipfsidoptions)

Runs just fine after setting up the client successfully.

### [ipfs.add](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options)

- Async generators have to be transformed as they are not available in JSC. The Babel plugin [@babel/plugin-proposal-async-generator-functions](https://babeljs.io/docs/en/babel-plugin-proposal-async-generator-functions) takes care of that.

- The `FormData` API [implementation](https://github.com/facebook/react-native/blob/cd347a7e0ed29ae1049e041fcb34588e1aac76f9/Libraries/Network/FormData.js#L51) provided by React Native only has `append` and `getParts` methods implemented. However, IPFS uses the `set` method and thus an error is being thrown.
