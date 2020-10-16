import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import {inspect} from 'util';
import {useIpfs} from '../../ipfs-http-client';

const CatScreen = () => {
  const {client} = useIpfs();

  const cat = async () => {
    const CID = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB';

    try {
      const chunks = [];
      for await (const chunk of client.cat(CID)) {
        console.log('Demo App .cat', {chunk, type: typeof chunk});
        chunks.push(chunk);
      }
      const buffer = chunks.reduce((acc, chunk) => [...acc, ...chunk], []);
      const content = new TextDecoder().decode(new Uint8Array(buffer));

      console.log('Demo App .cat', {content});
    } catch (error) {
      console.error('Demo App .cat', {error});
    }
  };

  return (
    <View>
      <Button mode="contained" onPress={cat}>
        Press me
      </Button>
    </View>
  );
};

export default CatScreen;
