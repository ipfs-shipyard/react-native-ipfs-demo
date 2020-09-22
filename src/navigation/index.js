import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/home';
import IdScreen from '../screens/id';
import AddScreen from '../screens/add';

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
      name="Add"
      component={AddScreen}
      options={{title: 'ipfs.add()'}}
    />
  </Stack.Navigator>
);

export default AppStack;
