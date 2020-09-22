import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import {useIpfs} from '../../ipfs-http-client';

const IdScreen = () => {
  const {client} = useIpfs();

  const add = async () => {
    try {
      console.log(await client.id());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Button mode="contained" onPress={add}>
        Press me
      </Button>
    </View>
  );
};

export default IdScreen;
