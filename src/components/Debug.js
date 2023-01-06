import config from '~/config';

/**
 * A React component that renders the children only if the config.debug property is true.
 * @param {React.ReactNode} children - The children to render.
 * @returns None
 */
function Debug({ children }) {
  return config.debug === true ? <>{children}</> : null;
}

export default Debug;
