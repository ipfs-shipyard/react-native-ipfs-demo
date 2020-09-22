import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';

const runGenerator = () => {
  const generator = function* () {
    yield* Array(5)
      .fill()
      .map((_, i) => i);
  };

  for (const i of generator()) {
    console.log(`generator: ${i}`);
  }
};

const runAsyncGenerator = async () => {
  const generator = async function* () {
    const stream = Array(5)
      .fill()
      .map((_, i) => i);

    for (const i of stream) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      yield i;
    }
  };

  for await (const i of generator()) {
    console.log(`asyncGenerator: ${i}`);
  }
};

const runAsyncGenerator2 = async () => {
  const generator = async function* () {
    var stream = [Promise.resolve(4), Promise.resolve(9), Promise.resolve(12)];
    var total = 0;
    for await (let val of stream) {
      total += await val;
      yield total;
    }
  };

  for await (const i of generator()) {
    console.log(`asyncGenerator2: ${i}`);
  }
};

const HomeScreen = ({navigation}) => {
  return (
    <View>
      <Button mode="contained" onPress={() => navigation.navigate('Id')}>
        ipfs.id()
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Add')}>
        ipfs.add()
      </Button>
      <Button mode="contained" onPress={runGenerator}>
        generator
      </Button>
      <Button mode="contained" onPress={runAsyncGenerator2}>
        async generator
      </Button>
    </View>
  );
};

export default HomeScreen;
