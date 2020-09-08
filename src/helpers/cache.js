import redis from 'redis';

let client = null;

try {
  client = redis.createClient(process.env.REDIS_URL, {
    retry_strategy: (options) => {
      const { error } = options;
      console.log(error);
      return Math.min(options.attempt * 100, 3000);
    },
  });
} catch (err) {
  console.error(err);
}

export const exists = (key) => {
  if (!client) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    client.exists(key, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(reply);
    });
  });
};

export const get = (key) => {
  if (!client) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    client.get(key, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(reply);
    });
  });
};

export const set = (key, value) => {
  if (!client) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    client.set(key, value, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(reply);
    });
  });
};

export default {
  exists,
  get,
  set,
};
