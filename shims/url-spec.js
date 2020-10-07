import 'react-native-url-polyfill/auto';

// import NativeBlobModule from 'react-native/Libraries/Blob/NativeBlobModule';

// let BLOB_URL_PREFIX = null;

// if (
//   NativeBlobModule &&
//   typeof NativeBlobModule.getConstants().BLOB_URI_SCHEME === 'string'
// ) {
//   const constants = NativeBlobModule.getConstants();
//   BLOB_URL_PREFIX = constants.BLOB_URI_SCHEME + ':';
//   if (typeof constants.BLOB_URI_HOST === 'string') {
//     BLOB_URL_PREFIX += `//${constants.BLOB_URI_HOST}/`;
//   }
// }

// console.log('Demo App URL polyfill', {BLOB_URL_PREFIX});

// URL.createObjectURL = function (blob) {
//   if (BLOB_URL_PREFIX === null) {
//     throw new Error('Cannot create URL for blob!');
//   }
//   return `${BLOB_URL_PREFIX}${blob.data.blobId}?offset=${blob.data.offset}&size=${blob.size}`;
// };
