import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import {useIpfs} from '../../ipfs-http-client';

const addString = (client) => async () => {
  const file = {
    path: '/tmp/rn-ipfs-add-string',
    content: 'React Native IPFS',
  };
  try {
    console.log('Demo App .add string', {result: await client.add(file)});
  } catch (error) {
    console.error('Demo App .add string', {error});
  }
};

const AddScreen = () => {
  const {client} = useIpfs();

  return (
    <View>
      <Button mode="contained" onPress={addString(client)}>
        Add string
      </Button>
    </View>
  );
};

export default AddScreen;
