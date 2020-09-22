// delete global.SharedArrayBuffer;

import {polyfillGlobal} from 'react-native/Libraries/Utilities/PolyfillFunctions';

console.log('arraybuffer', {ArrayBuffer});

polyfillGlobal('SharedArrayBuffer', () => ArrayBuffer);
