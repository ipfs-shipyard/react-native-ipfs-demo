import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import Navigation from './navigation';
import {Provider as IpfsProvider} from './ipfs-http-client';

const App = () => (
  <IpfsProvider>
    <PaperProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </PaperProvider>
  </IpfsProvider>
);

// console.log({navigator, process, File, ReadableStream});

export default App;
