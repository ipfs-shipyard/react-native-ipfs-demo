import React, {createContext, useContext, useMemo} from 'react';
import ipfsHttpClient from 'ipfs-http-client';

const IpfsHttpClientContext = createContext();

const Provider = ({children}) => {
  const client = useMemo(() => ipfsHttpClient('http://localhost:5002'), []);

  return (
    <IpfsHttpClientContext.Provider value={{client}}>
      {children}
    </IpfsHttpClientContext.Provider>
  );
};

const useIpfs = () => useContext(IpfsHttpClientContext);

export {Provider, useIpfs};
