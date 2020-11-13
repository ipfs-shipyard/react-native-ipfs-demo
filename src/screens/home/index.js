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

const readableStreamTest1 = async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let controller;

  const rs = new ReadableStream({
    // async start(c) {
    //   controller = c;
    //   await delay(250);
    //   c.enqueue('readable');
    //   await delay(250);
    //   c.enqueue('stream');
    //   await delay(250);
    //   c.enqueue('polyfill');
    //   c.close();
    // },
    async pull(c) {
      controller = c;
      await delay(250);
      c.enqueue('readable');
      await delay(250);
      c.enqueue('stream');
      await delay(250);
      c.enqueue('polyfill');
      c.close();
    },
  });

  const reader = rs.getReader();

  const read = () => {
    return reader
      .read()
      .then(({done, value}) => {
        if (done) {
          console.log('readableStreamTest1 done');
          return;
        }

        console.log('readableStreamTest1 read', {value});

        return read();
      })
      .catch((error) => console.error('readableStreamTest1 read', {error}));
  };

  read();
  await delay(500);
  controller.error(new Error('error'));
};

const readableStreamTest2 = async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let controller;

  const rs = new ReadableStream({
    // async start(c) {
    //   controller = c;
    //   await delay(250);
    //   c.enqueue('readable');
    //   await delay(250);
    //   c.enqueue('stream');
    //   await delay(250);
    //   c.enqueue('polyfill');
    //   c.close();
    // },
    async pull(c) {
      controller = c;
      await delay(250);
      c.enqueue('readable');
      await delay(250);
      c.enqueue('stream');
      await delay(250);
      c.enqueue('polyfill');
      c.close();
    },
  });

  const read = async () => {
    try {
      for await (const chunk of rs) {
        console.log('readableStreamTest2 read', {chunk});
      }
    } catch (error) {
      console.error('readableStreamTest2 read', {error});
    }
  };

  read();
  await delay(500);
  // try {
  //   controller.error(new Error('error'));
  // } catch (error) {
  //   console.error('readableStreamTest2 controller.error', {error});
  // }
  controller.error(new Error('error'));
};

const consoleErrorTest = () => {
  console.error('error');
};

const consoleWarnTest = () => {
  console.warn('warn');
};

const HomeScreen = ({navigation}) => {
  return (
    <View>
      <Button mode="contained" onPress={() => navigation.navigate('Id')}>
        ipfs.id()
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Ls')}>
        ipfs.ls()
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Add')}>
        ipfs.add()
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Get')}>
        ipfs.get()
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Cat')}>
        ipfs.cat()
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Pubsub')}>
        ipfs.pubsub
      </Button>
      <Button mode="contained" onPress={runGenerator}>
        generator
      </Button>
      <Button mode="contained" onPress={runAsyncGenerator2}>
        async generator
      </Button>
      <Button mode="contained" onPress={readableStreamTest1}>
        readablestream test 1
      </Button>
      <Button mode="contained" onPress={readableStreamTest2}>
        readablestream test 2
      </Button>
      <Button mode="contained" onPress={consoleErrorTest}>
        console.error
      </Button>
      <Button mode="contained" onPress={consoleWarnTest}>
        console.warn
      </Button>
    </View>
  );
};

export default HomeScreen;
