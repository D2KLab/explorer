import { useEffect, useState, useRef } from 'react';

import Burger from '@components/Burger';
import Menu from '@components/Menu';

/**
 * A hook that calls a handler function when the user clicks outside of the given ref.
 * @param {React.RefObject<HTMLElement>} ref - the ref to check for clicks outside of.
 * @param {(event: MouseEvent) => void} handler - the function to call when the user clicks outside of the ref.
 * @returns None
 */
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

/**
 * A React component that renders the layout of the page.
 * ```jsx
 * <Layout>
 *  <Header />
 *  <Body>
 *   Your content
 *  </Body>
 *  <Footer />
 * </Layout>
 * ```
 * @param {React.ReactNode} children - The children of the component.
 * @returns {React.ReactNode} The layout of the page.
 */
function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const node = useRef();
  useOnClickOutside(node, () => setOpen(false));

  return (
    <>
      {children}
      <div ref={node}>
        <Burger open={open} setOpen={setOpen} />
        <Menu open={open} setOpen={setOpen} />
      </div>
    </>
  );
}

export default Layout;
