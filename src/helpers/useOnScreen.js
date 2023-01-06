import { useState, useEffect } from 'react';

/**
 * A hook that returns whether or not an element is on screen.
 * @param {React.RefObject<HTMLElement>} ref - The ref of the element to check.
 * @param {string} [rootMargin='0px'] - The root margin to use for the observer.
 * @param {number} [threshold=0] - The threshold to use for the observer.
 * @returns {boolean} - Whether or not the element is on screen.
 */
function useOnScreen(ref, rootMargin = '0px', threshold = 0) {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
        threshold,
      }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return isIntersecting;
}

export default useOnScreen;
