import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

import GlobalStyle from '@styles/global';
import Burger from '@components/Burger';
import Menu from '@components/Menu';
import Sidebar from '@components/Sidebar';
import { Container as ContentContainer } from '@components/Content';

/**
 * Main layout container.
 *
 * ```
 * <Layout>
 *  <Header />
 *  <Body>
 *   Your content
 *  </Body>
 *  <Footer />
 * </Layout>
 * ```
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

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const node = useRef();
  useOnClickOutside(node, () => setOpen(false));

  return (
    <>
      <GlobalStyle />
      {children}
      <div ref={node}>
        <Burger open={open} setOpen={setOpen} />
        <Menu open={open} setOpen={setOpen} />
      </div>
    </>
  );
};

export default Layout;
