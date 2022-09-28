import config from '~/config';

/**
 * Debug container. Only visible if `debug` is set to `true` in config.js.
 */

function Debug({ children }) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return config.debug === true ? <>{children}</> : null
}

export default Debug;
