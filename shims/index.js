import 'react-native-polyfill-globals/auto';
import {fetch, Headers, Request, Response} from '@react-native-community/fetch';

global.Headers = Headers;
global.Request = Request;
global.Response = Response;
global.fetch = fetch;
