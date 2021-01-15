# HTTP client

## Factory

The `URL` API needs to be polyfilled otherwise an error is thrown as [many methods](https://github.com/facebook/react-native/blob/cd347a7e0ed29ae1049e041fcb34588e1aac76f9/Libraries/Blob/URL.js#L115) are not implemented in React Native and thus not conformant with the [spec](https://url.spec.whatwg.org). The exact same goes for `URLSearchParams` API as only a [few methods](https://github.com/facebook/react-native/blob/cd347a7e0ed29ae1049e041fcb34588e1aac76f9/Libraries/Blob/URL.js#L56) are implemented as well.

To work around these issues, we used the implementations provided by [`whatwg-url`](https://github.com/jsdom/whatwg-url) polyfill. `whatwg-url` depends on two core Node.js modules, `punycode` and `util`, which are not available in React Native environment. We have shimed them with alternative implementations:

- `util`: https://github.com/browserify/node-util. `whatwg-url` attempts to require `TextEncoder` and `TextDecoder` APIs from `node-util` and if such objects are not found, it fallbacks to `global.TextEncoder` and `global.TextDecoder`. Since `node-util` does not provide encoding APIs as in Node.js, we have to polyfill them with [`text-encoding`](https://github.com/inexorabletash/text-encoding) instead.
- `punycode`: https://github.com/bestiejs/punycode.js

`whatwg-url` also depends on standard built-in objects such as `BigInt` and `SharedArrayBuffer` via [webidl-conversions](https://github.com/jsdom/webidl-conversions) which are not available in React Native as well. While we can [polyfill](https://github.com/peterolson/BigInteger.js) `BigInt`, `SharedArrayBuffer` is little more tricker. If IPFS does not need `SharedArrayBuffer`, we can probably come up with a way to cheat the type checks out by, e.g., using `ArrayBuffer` in its place. Right now we're using [`react-native-url-polyfill`](https://github.com/charpeni/react-native-url-polyfill), which is an optimized URL standard-compliant implementation for React Native based on [`whatwg-url-without-unicode`](https://github.com/charpeni/whatwg-url). However, it comes without Unicode support thus it's more light in size.

Our experience reveals both `whatwg-url` and `react-native-url-polyfill` appear to not be so comformant with the spec as they claim to be. When the `base` argument of the `URL` constructor is an empty string and the `url` argument is an absolute URL, the constructor is throwing an [error](https://github.com/charpeni/whatwg-url/blob/f934c822a2598ecef25ca7b224e96c29f7e52c65/lib/URL-impl.js#L15) indicating `base` is invalid. As per spec, when `url` is absolute the provided `base` should be ignored. However, it is not implemented this way.

Another issue we detected concerns the [normalization logic](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/core.js#L21) for the input options of the IPFS HTTP client factory. It seems there is a case where `options` is a boxed string and an error is thrown by the `URL` [constructor](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/core.js#L28) because `options.url` is undefined.

## [ipfs.id](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/MISCELLANEOUS.md#ipfsidoptions)

Runs just fine after setting up the client successfully.

## [ipfs.add](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options)

Works with the hacks below.

## Async generators

Async generators have to be transformed as they are not available in JSC. The Babel plugin [@babel/plugin-proposal-async-generator-functions](https://babeljs.io/docs/en/babel-plugin-proposal-async-generator-functions) takes care of that.

## FormData

The [browser implementation](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/multipart-request.browser.js) of IPFS for multipart request uses the `FormData` API underneath. However, the [implementation](https://github.com/facebook/react-native/blob/cd347a7e0ed29ae1049e041fcb34588e1aac76f9/Libraries/Network/FormData.js#L51) provided by React Native is broken as it only implements `append` and `getParts` methods. The latter is not even part of the `FormData` [spec](https://xhr.spec.whatwg.org/#interface-formdata) but React Native uses it [internally](https://github.com/facebook/react-native/blob/61cfa97067eec6d33c23670ae2128348fcff5d1b/Libraries/Network/convertRequestBody.js#L34) to construct a HTTP request and pass it down to [iOS](https://github.com/facebook/react-native/blob/61cfa97067eec6d33c23670ae2128348fcff5d1b/Libraries/Network/RCTNetworking.ios.js) and [Android](https://github.com/facebook/react-native/blob/61cfa97067eec6d33c23670ae2128348fcff5d1b/Libraries/Network/RCTNetworking.android.js) implementations of the networking layer. IPFS uses the `set` method which is causing the call to `.add` to error out. To fix this issue, we have [patched](patches/react-native+0.63.2.patch) `FormData` to implement the missing method. 

Another issue we uncovered is that `FormData` does not know how to handle `Blob` objects. Instead, it accepts a blob-like object which contains a `uri` property that indicates where a native file can be found in the device's disk. However, `Blob`s do not have this property, so they have to be handled differently by `FormData`. In React Native, `Blob`s are created and managed in the native side. In JS land, it's only possible to hold an opaque reference to a given blob. However, each blob has a `blobId` and an URI can be created based off it with the following scheme: `blob:<Blob.data.blobId>?offset=<Blob.data.offset>&size=<Blob.data.size>`. [`URL.createObjectURL`](https://github.com/facebook/react-native/blob/4409642811c787052e0baeb92e2679a96002c1e3/Libraries/Blob/URL.js#L118) static method does just that, which is part of the spec and can be found in React Native's implementation of the URL API. The same [method](https://github.com/charpeni/react-native-url-polyfill/blob/c32cbdc97fb6569edd6d941c3600196debeb0ad5/js/URL.js#L45) can be found in the package which provides the URL polyfill we're using. Given a `blobId`, all we have to do is patch `FormData` to generate the URI for all `Blob` parts and return it in the `getParts` method, as expected by its interface. With this patch in place, HTTP requests that send `FormData` with `Blobs` can get through and reach their destination with complete and intact data. 

## ReadableStream

`ReadableStream` is not supported in React Native so request and response body streaming does not work. Furthermore, React Native's Fetch API implementation provided by [`whatwg-fetch`](https://github.com/github/fetch) does not support `ReadableStream`s either. As such, we aren't yet able to handle responses as [`response.body`](https://developer.mozilla.org/en-US/docs/Web/API/Response#Body_Interface_Properties) is never defined and, consequenly, [`getReader()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader) [fails](https://github.com/ipfs/js-ipfs-utils/blob/78edc8b4129f0acd37a3d275bdd8a7a9ff989b5c/src/http.js#L297). To workaround this issue, we have created a brute force implementation of `ReadableStream` and added it to the `whatwg-fetch` [source](patches/whatwg-fetch+3.4.0.patch) for the time being. Note that, however, this implementation is too naive and does not offer true streaming. All it does it get the response body with `Response.arrayBuffer()` and wrap it with a `Uint8Array` as per [`ReadableStreamDefaultReader.read`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/read) spec. Thus, the whole response body is returned in a single chunk. See https://github.com/github/fetch/issues/746#issuecomment-573251497 for more info.

## FileReader

Judging by our experiments, response bodies in React Native appear to always be of blob type. As such, in order to `whatwg-fetch`'s `Response.arrayBuffer()` to work, we had to implement [`FileReader.readAsArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer) which React Native [does not](https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Blob/FileReader.js#L84) at the moment. In order to get the raw binary data from the blob, we had to read it as a data URL and decode with `atob` which had to be polyfilled with the `base-64` package since it does not exist in the React Native environment.

~~You can find the changes we have made in the [patch](patches/react-native+0.63.2.patch) provided.~~ Now provided by `react-native-polyfill-globals`.

## Node.js implementation (not being used)

The [Node.js implementation](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/multipart-request.js) of IPFS for multipart request does not work as well. Although the HTTP request gets through successfully as the multipart request is created manually, the request body data is simply not correct and the file is not created in the IPFS node. `node-fetch`, the [Fetch API](https://fetch.spec.whatwg.org/) implementation in use for Node.js, [accepts](https://github.com/node-fetch/node-fetch#bodybody) a Node.js' `Readable` [stream](https://github.com/ipfs/js-ipfs/blob/3ff833db6444a3e931db9b76bf74c3420e57ee02/packages/ipfs-http-client/src/lib/multipart-request.js#L71) as the request body. When `it-to-stream` is required in React Native, a `Readable` stream is created from [`readable-stream`](https://github.com/alanshaw/it-to-stream/blob/d7e9611ce126f9ea4282459bc85be1fa0c18ee2a/src/duplex.js#L55) package which is not compatible with [`ReadableStream`](https://streams.spec.whatwg.org/#readablestream) WHATWG API.

It's also worth noting that `nanoid` does not work out of the box in React Native because there is no built-in secure random generator. The recommended go to [solution](https://github.com/ai/nanoid/blob/a3770f1d80dc23220bd51a87a27acedf85a3050f/index.browser.js#L13) is to polyfill `crypto.getRandomValues` global natively with [`react-native-get-random-values`](https://github.com/LinusU/react-native-get-random-values) as soon as the app starts. A solution such as [`react-native-crypto`](https://github.com/tradle/react-native-crypto) might work as well, but it's probably overkill for this sole purpose as it offers much more cryptographic functions beyond what `nanoid` requires.

## [ipfs.get](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsgetipfspath-options)

Works with the fixes made for `ipfs.add`.

## [ipfs.cat](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfscatipfspath-options)

Works with the fixes made for `ipfs.add`.

## [ipfs.pubsub](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/PUBSUB.md) and [ipfs.swarm](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/SWARM.md)

For pubsub, subscriptions operate on the basis of a long-running HTTP response, i.e., an endless stream. As React Native does not support returning a `ReadableStream` natively nor provide access to the underlying byte-stream (only base64 can be read through the bridge), so we have to fallback to `XMLHttpRequest`. React Native's XHR provides [progress events](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/progress_event) which buffers text allows us to concatenate a response by encoding it into its UTF-8 byte representation using the `TextEncoder` API. Although [very inefficient](https://github.com/jonnyreeves/fetch-readablestream/blob/cabccb98788a0141b001e6e775fc7fce87c62081/src/defaultTransportFactory.js#L33), it's some of sort of pseudo-streaming that works. The problem, however, is that we're reading text and not raw binary data so this may be a shortcoming for some use cases. Pubsub subcriptions are currently base64 encoded, so we should be fine for now in that regard.

To make pubsub subscriptions work, we have polyfilled [`ReadableStream`](https://github.com/MattiasBuelens/web-streams-polyfill) and integrated the stream's controller with XHR's progress events in React Native's [`fetch` implementation](patches/react-native+0.63.2.patch). It's important to note that progress events only work when [`XMLHttpRequest.responseType`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType) is set to `text`. If you wish to process raw binary data, either `blob` or `arraybuffer` has to be used. In this case, the response is read as a whole, when the load event is fired, and enqueued to the stream's controller as single chunk. 

Other HTTP client methods continue to work as expected after these changes, on both iOS and Android.
