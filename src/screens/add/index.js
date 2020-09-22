import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import {useIpfs} from '../../ipfs-http-client';

const addWithString = (client) => async () => {
  const file = {
    path: '/tmp/rn-ipfs-demo.txt',
    content: 'React Native IPFS Demo',
  };
  try {
    console.log(await client.add(file));
  } catch (error) {
    console.error(error);
  }
};

const AddScreen = () => {
  const {client} = useIpfs();

  return (
    <View>
      <Button mode="contained" onPress={addWithString(client)}>
        Add string
      </Button>
    </View>
  );
};

export default AddScreen;
