import config from '~/config';

/**
 * Debug container. Only visible if `debug` is set to `true` in config.js.
 */

function Debug({ children }) {
  return config.debug === true ? <>{children}</> : null;
}

export default Debug;
