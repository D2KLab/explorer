import { useRouter } from 'next/router';
import { useEffect } from 'react';
import config from '~/config';

/**
 * Sends a Google Analytics event to the current page.
 * @param {string} url - the URL of the page that the event is sent to.
 * @returns None
 */
const handleRouteChange = (url) => {
  if (typeof window?.gtag !== 'undefined' && typeof config.analytics?.id !== 'undefined') {
    window.gtag('config', config.analytics.id, {
      page_path: url,
    });
  }
};

/**
 * A function that handles the route change event and reports it to Google Analytics.
 * @returns None
 */
function GoogleAnalytics() {
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);
}

export default GoogleAnalytics;
