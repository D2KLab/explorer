import { useEffect, useRef } from 'react';

/**
 * A hook that takes in a function and an array of dependencies.
 * The function will only be called once, after the first render.
 * @param {Function} func - the function to call once.
 * @param {Array} deps - the dependencies that will cause the function to be called again.
 * @returns None
 */
const useDidMountEffect = (func, deps) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};

export default useDidMountEffect;
