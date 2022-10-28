import { useRef, useEffect } from 'react';

import useOnScreen from '@helpers/useOnScreen';

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
