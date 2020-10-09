import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import Navigation from './navigation';
import {Provider as IpfsProvider} from './ipfs-http-client';

// console.log('App', {ArrayBuffer, FileReader});

// fetch('https://jsonplaceholder.typicode.com/todos/1')
//   .then((response) => response.json())
//   .then((json) => console.log(json));

const App = () => (
  <IpfsProvider>
    <PaperProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </PaperProvider>
  </IpfsProvider>
);

export default App;
