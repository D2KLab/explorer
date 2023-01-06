import { useRef, useEffect } from 'react';

import useOnScreen from '@helpers/useOnScreen';

/**
 * A custom hook that detects when a DOM element is on screen.
 * @param {React.RefObject<HTMLElement>} ref - The ref of the element to check.
 * @param {number} [rootMargin=0] - The root margin to use when checking for on screen.
 * @param {number} [threshold=0] - The threshold to use when checking for on screen.
 * @param {React.ReactNode} children - the children to render
 * @returns {boolean} - Whether or not the element is on screen.
 */
function ScrollDetector({ onAppears, onDisappears, rootMargin, threshold, children, ...props }) {
  const $ref = useRef(null);
  const isRefOnScreen = useOnScreen($ref, rootMargin, threshold);

  useEffect(() => {
    if (isRefOnScreen && typeof onAppears === 'function') onAppears();
    if (!isRefOnScreen && typeof onDisappears === 'function') onDisappears();
  }, [isRefOnScreen]);

  return (
    <div ref={$ref} {...props}>
      {children}
    </div>
  );
}

export default ScrollDetector;
