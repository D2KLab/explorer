import { createGlobalStyle } from 'styled-components';
// eslint-disable-next-line import/no-named-default
import { default as NProgressRoot } from 'nprogress';

import theme from '~/theme';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

let timeout;

const start = () => {
  if (typeof window !== 'undefined') {
    timeout = setTimeout(NProgressRoot.start, 100);
  }
};

const done = () => {
  clearTimeout(timeout);
  if (typeof window !== 'undefined') {
    NProgressRoot.done();
  }
};

function NProgress() {
  const router = useRouter();

  useEffect(() => {
    NProgressRoot.configure({
      minimum: 0.15,
      trickleRate: 0.07,
      trickleSpeed: 360,
      showSpinner: false,
    });

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);

    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, []);
};

export const NProgressStyle = createGlobalStyle`
  /* Make clicks pass-through */
  #nprogress {
    pointer-events: none;
  }

  #nprogress .bar {
    background: ${theme.colors.primary};

    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;

    width: 100%;
    height: 2px;
  }

  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px ${theme.colors.primary}, 0 0 5px ${theme.colors.primary};
    opacity: 1;

    -webkit-transform: rotate(3deg) translate(0px, -4px);
    -ms-transform: rotate(3deg) translate(0px, -4px);
    transform: rotate(3deg) translate(0px, -4px);
  }

  #nprogress .spinner {
    display: block;
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
  }

  #nprogress .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;

    border: solid 2px transparent;
    border-top-color: ${theme.colors.primary};
    border-left-color: ${theme.colors.primary};
    border-radius: 50%;

    -webkit-animation: nprogress-spinner 400ms linear infinite;
    animation: nprogress-spinner 400ms linear infinite;
  }

  .nprogress-custom-parent {
    overflow: hidden;
    position: relative;
  }

  .nprogress-custom-parent #nprogress .spinner,
  .nprogress-custom-parent #nprogress .bar {
    position: absolute;
  }

  @-webkit-keyframes nprogress-spinner {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes nprogress-spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default NProgress;
