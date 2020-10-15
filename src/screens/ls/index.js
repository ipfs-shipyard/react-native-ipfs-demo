import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import {inspect} from 'util';
import {useIpfs} from '../../ipfs-http-client';

const LsScreen = () => {
  const {client} = useIpfs();

  const ls = async () => {
    const CID = 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr';

    try {
      for await (const file of client.ls(CID)) {
        console.log('Demo App .ls', {file: inspect(file)});
      }
    } catch (error) {
      console.error('Demo App .ls', {error});
    }
  };

  return (
    <View>
      <Button mode="contained" onPress={ls}>
        Press me
      </Button>
    </View>
  );
};

export default LsScreen;
