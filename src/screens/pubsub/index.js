import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import {inspect} from 'util';
import multiaddr from 'multiaddr';
import {useIpfs} from '../../ipfs-http-client';

const TOPIC = 'react-native-demo';
const ADDR = multiaddr(
  '/ip4/127.0.0.1/tcp/4002/p2p/QmVxjzyvjNHLtupTX7P1ELZFn4y9KugkP18BU1yA2ppNK8',
);

const handleMessage = (msg) => console.log('Demo app .pubsub message', {msg});

const handleError = (error) => console.log('Demo app .pubsub error', {error});

const PubsubScreen = () => {
  const {
    client: {pubsub, swarm},
  } = useIpfs();

  const connect = async () => {
    try {
      await swarm.connect(ADDR);

      console.log('Demo App .pubsub connect', {addr: ADDR});
    } catch (error) {
      console.error('Demo App .pubsub connect', {addr: ADDR, error});
    }
  };

  const disconnect = async () => {
    try {
      await swarm.disconnect(ADDR);

      console.log('Demo App .pubsub disconnect', {addr: ADDR});
    } catch (error) {
      console.error('Demo App .pubsub disconnect', {addr: ADDR, error});
    }
  };

  const subscribe = async () => {
    try {
      await pubsub.subscribe(TOPIC, handleMessage, {
        onError: handleError,
      });

      console.log('Demo App .pubsub subscribe', {topic: TOPIC});
    } catch (error) {
      console.error('Demo App .pubsub subscribe', {topic: TOPIC, error});
    }
  };

  const unsubscribe = async () => {
    try {
      await pubsub.unsubscribe(TOPIC, handleMessage);

      console.log('Demo App .pubsub unsubscribe', {topic: TOPIC});
    } catch (error) {
      console.error('Demo App .pubsub unsubscribe', {topic: TOPIC, error});
    }
  };

  const publish = async () => {
    try {
      const msg = new TextEncoder().encode('hello');
      await pubsub.publish(TOPIC, msg);

      console.log('Demo App .pubsub publish', {topic: TOPIC, msg});
    } catch (error) {
      console.error('Demo App .pubsub publish', {error});
    }
  };

  return (
    <View>
      <Button mode="contained" onPress={connect}>
        Connect
      </Button>
      <Button mode="contained" onPress={disconnect}>
        Disconnect
      </Button>
      <Button mode="contained" onPress={subscribe}>
        Subscribe
      </Button>
      <Button mode="contained" onPress={unsubscribe}>
        Unsubscribe
      </Button>
      <Button mode="contained" onPress={publish}>
        Publish
      </Button>
    </View>
  );
};

export default PubsubScreen;
