import { useRef, useEffect } from 'react';
import useOnScreen from '@helpers/useOnScreen';

const ScrollDetector = ({ onAppears, onDisappears, rootMargin, ...props }) => {
  const $ref = useRef(null);
  const isRefOnScreen = useOnScreen($ref, rootMargin);

  useEffect(() => {
    if (isRefOnScreen && typeof onAppears === 'function') onAppears();
    if (!isRefOnScreen && typeof onDisappears === 'function') onDisappears();
  }, [isRefOnScreen]);

  return <span ref={$ref} {...props} />;
};

export default ScrollDetector;
