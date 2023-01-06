import { createClient } from 'redis';

let client = null;

/**
 * Connect to the Redis server.
 * @returns {Promise} - a promise that resolves once the client is connected.
 */
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

/**
 * Checks if the given key exists in the database.
 * @param {string} key - the key to check for existence
 * @returns {Promise<boolean>} - a promise that resolves to true if the key exists, false otherwise.
 */
export const exists = async (key) => {
  if (!client) {
    await connect();
  }
  return client.exists(key);
};

/**
 * Gets the value of the given key from the Redis database.
 * @param {string} key - the key to get the value of
 * @returns {Promise<string>} - the value of the key
 */
export const get = async (key) => {
  if (!client) {
    await connect();
  }
  return client.get(key);
};

/**
 * Sets a key/value pair in Redis.
 * @param {string} key - the key to set
 * @param {string} value - the value to set
 * @param {number} [expiry=86400] - the number of seconds until the key expires
 * @returns {Promise} - a promise that resolves when the key/value pair was set
 */
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
