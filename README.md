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

- The [browser implementation](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/multipart-request.browser.js) of IPFS for multipart request uses the `FormData` API underneath. However, the [implementation](https://github.com/facebook/react-native/blob/cd347a7e0ed29ae1049e041fcb34588e1aac76f9/Libraries/Network/FormData.js#L51) provided by React Native is broken as it only implements `append` and `getParts` methods. The latter is not even part of the `FormData` [spec](https://xhr.spec.whatwg.org/#interface-formdata). However, IPFS uses the `set` method which causes the call to error out. While `FormData` can be polyfilled with [`formdata-polyfill`](https://github.com/jimmywarting/FormData), requests are still not getting through when `ipfs.add` is called with a content string which is then [transformed](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-core-utils/src/files/normalise-input/normalise-content.browser.js#L17) into React Native's [`Blob`](https://github.com/facebook/react-native/blob/4409642811c787052e0baeb92e2679a96002c1e3/Libraries/Blob/Blob.js). With the `FormData` polyfill in place, we were able to pass a `Blob` to the `set` method. When `fetch` is called, the `body` option is checked for `FormData` and a new `Blob` is [created out of it](https://github.com/jimmywarting/FormData/blob/18479550bebb79ae76c39cf23c2694619463170f/FormData.js#L438). This new `Blob` now holds the [complete request body](https://github.com/jimmywarting/FormData/blob/18479550bebb79ae76c39cf23c2694619463170f/FormData.js#L342). The request is initiated but halts somewhere along the way after [XMLHttpRequest.send](https://github.com/github/fetch/blob/5e3aa109b5d23a982c4a01718469e2c63bc6815f/fetch.js#L586) is called. We're not yet sure where the root cause of the issue may lie, but might be related to the fact that React Native's `Blob` interface is not compliant with the [spec](https://w3c.github.io/FileAPI/#blob-section), although that would be kind of odd considering React Native provides their own implementions for `Blob` and [`XMLHttpRequest`](https://github.com/facebook/react-native/blob/86cad7d69099baaaeae10ac7c0912a023101f257/Libraries/Network/XMLHttpRequest.js), so, in theory, they should be compatible.

- The [Node.js implementation](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/multipart-request.js) of IPFS for multipart request does not work as well. Although the HTTP request gets through successfully as the multipart request is created manually, the request body data is simply not correct and the file is not created in the IPFS node. `node-fetch`, the [Fetch API](https://fetch.spec.whatwg.org/) implementation in use for Node.js, [accepts](https://github.com/node-fetch/node-fetch#bodybody) a Node.js' `Readable` [stream](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/multipart-request.js#L71) as the request body. When `it-to-stream` is required in React Native, a `Readable` stream is created from [`readable-stream`](https://github.com/alanshaw/it-to-stream/blob/d7e9611ce126f9ea4282459bc85be1fa0c18ee2a/src/duplex.js#L55) package which is not compatible with [`ReadableStream`](https://streams.spec.whatwg.org/#readablestream) WHATWG API.

    - It's also worth noting that `nanoid` does not work out of the box in React Native because there is no built-in secure random generator. The recommended go to [solution](https://github.com/ai/nanoid/blob/a3770f1d80dc23220bd51a87a27acedf85a3050f/index.browser.js#L13) is to polyfill `crypto.getRandomValues` global natively with [`react-native-get-random-values`](https://github.com/LinusU/react-native-get-random-values) as soon as the app starts. A solution such as [`react-native-crypto`](https://github.com/tradle/react-native-crypto) might work as well, but it's probably overkill for this sole purpose as it offers much more cryptographic functions beyond what `nanoid` requires.

- `ReadableStream` is not supported in React Native so request and response body streaming does not work. Furthermore, React Native's Fetch API implementation provided by [`whatwg-fetch`](https://github.com/github/fetch) does not support `ReadableStream`s either. While we could fix `FormData` to get requests through, we wouldn't be able to handle responses as [`response.body`](https://developer.mozilla.org/en-US/docs/Web/API/Response#Body_Interface_Properties) is never defined and, consequenly, [`getReader()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader) [fails](https://github.com/ipfs/js-ipfs-utils/blob/78edc8b4129f0acd37a3d275bdd8a7a9ff989b5c/src/http.js#L297).
