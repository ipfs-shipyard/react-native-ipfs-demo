import {Platform} from 'react-native';

const HTTP_CLIENT_URL = Platform.select({
  ios: 'http://localhost:5002',
  android: 'http://10.0.2.2:5002',
});

export {HTTP_CLIENT_URL};
