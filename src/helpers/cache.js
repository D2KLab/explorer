import { createClient } from 'redis';

let client = null;

const connect = async () => {
  client = createClient({
    url: process.env.REDIS_URL,
    retry_strategy: (options) => {
      const { error } = options;
      console.log(error);
      return Math.min(options.attempt * 100, 3000);
    },
  });
  return client.connect();
};

export const exists = async (key) => {
  if (!client) {
    await connect();
  }
  return client.exists(key);
};

export const get = async (key) => {
  if (!client) {
    await connect();
  }
  return client.get(key);
};

export const set = async (key, value, expiry = 86400) => {
  if (!client) {
    await connect();
  }
  return client.set(key, value, 'EX', expiry);
};

const cache = {
  exists,
  get,
  set,
};

export default cache;
