import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/home';
import LsScreen from '../screens/ls';
import IdScreen from '../screens/id';
import AddScreen from '../screens/add';
import GetScreen from '../screens/get';
import CatScreen from '../screens/cat';
import PubsubScreen from '../screens/pubsub';

const Stack = createStackNavigator();

const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{title: 'IPFS Demo'}}
    />
    <Stack.Screen
      name="Id"
      component={IdScreen}
      options={{title: 'ipfs.id()'}}
    />
    <Stack.Screen
      name="Ls"
      component={LsScreen}
      options={{title: 'ipfs.ls()'}}
    />
    <Stack.Screen
      name="Get"
      component={GetScreen}
      options={{title: 'ipfs.get()'}}
    />
    <Stack.Screen
      name="Cat"
      component={CatScreen}
      options={{title: 'ipfs.cat()'}}
    />
    <Stack.Screen
      name="Add"
      component={AddScreen}
      options={{title: 'ipfs.add()'}}
    />
    <Stack.Screen
      name="Pubsub"
      component={PubsubScreen}
      options={{title: 'ipfs.pubsub'}}
    />
  </Stack.Navigator>
);

export default AppStack;
