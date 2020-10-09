import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import {useIpfs} from '../../ipfs-http-client';

const addString = (client) => async () => {
  const file = {
    path: '/tmp/rn-ipfs-add-string',
    content: '邑中陽裏人也，姓劉氏。母媼嘗息大澤之陂，夢與神遇',
  };
  try {
    console.log('Demo App .add string', {result: await client.add(file)});
  } catch (error) {
    console.error('Demo App .add string', {error});
  }
};

const addUint8Array = (client) => async () => {
  const file = {
    path: '/tmp/rn-ipfs-add-uint8array',
    content: Uint8Array.from('123456789'),
  };
  try {
    console.log('Demo App .add Uint8Array', {result: await client.add(file)});
  } catch (error) {
    console.error('Demo App .add Uint8Array', {error});
  }
};

const addUint8Arrays = (client) => async () => {
  const file = {
    path: '/tmp/rn-ipfs-add-uint8arrays',
    content: [
      Uint8Array.from('123456789'),
      Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    ],
  };
  try {
    console.log('Demo App .add Uint8Arrays', {result: await client.add(file)});
  } catch (error) {
    console.error('Demo App .add Uint8Arrays', {error});
  }
};

const addNumbers = (client) => async () => {
  const file = {
    path: '/tmp/rn-ipfs-add-numbers',
    content: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  };
  try {
    console.log('Demo App .add numbers', {result: await client.add(file)});
  } catch (error) {
    console.error('Demo App .add numbers', {error});
  }
};

const addBlob = (client) => async () => {
  const buffer = new ArrayBuffer(9);
  const view = new Uint8Array(buffer);

  view.set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const file = {
    path: '/tmp/rn-ipfs-add-blob',
    content: new Blob(['React Native IPFS', view.buffer]),
  };
  try {
    console.log('Demo App .add blob', {result: await client.add(file)});
  } catch (error) {
    console.error('Demo App .add blob', {error});
  }
};

const AddScreen = () => {
  const {client} = useIpfs();

  return (
    <View>
      <Button mode="contained" onPress={addString(client)}>
        Add string
      </Button>
      <Button mode="contained" onPress={addUint8Array(client)}>
        Add Uint8Array
      </Button>
      <Button mode="contained" onPress={addUint8Arrays(client)}>
        Add Uint8Arrays
      </Button>
      <Button mode="contained" onPress={addNumbers(client)}>
        Add numbers
      </Button>
      <Button mode="contained" onPress={addBlob(client)}>
        Add blob
      </Button>
    </View>
  );
};

export default AddScreen;
