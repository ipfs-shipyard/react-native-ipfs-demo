import {polyfillGlobal} from 'react-native/Libraries/Utilities/PolyfillFunctions';

polyfillGlobal('BigInt', () => require('big-integer'));
