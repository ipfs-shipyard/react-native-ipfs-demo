import React, {createContext, useContext, useEffect, useState} from 'react';
import ipfsHttpClient from 'ipfs-http-client';
import deviceInfo from 'react-native-device-info';

const IpfsHttpClientContext = createContext();

const Provider = ({children}) => {
  const [client, setClient] = useState();

  useEffect(() => {
    deviceInfo.isEmulator().then((isEmulator) => {
      setClient(
        ipfsHttpClient(
          isEmulator ? 'http://localhost:5002' : 'http://192.168.1.126:5002',
        ),
      );
    });
  }, []);

  return (
    <IpfsHttpClientContext.Provider value={{client}}>
      {children}
    </IpfsHttpClientContext.Provider>
  );
};

const useIpfs = () => useContext(IpfsHttpClientContext);

export {Provider, useIpfs};
