import {polyfillGlobal} from 'react-native/Libraries/Utilities/PolyfillFunctions';
import {ReadableStream} from 'web-streams-polyfill/ponyfill';

polyfillGlobal('ReadableStream', () => ReadableStream);
