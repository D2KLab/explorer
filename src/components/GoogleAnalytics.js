import { useRouter } from 'next/router';
import { useEffect } from 'react';

const handleRouteChange = (url) => {
  if (typeof window?.gtag !== 'undefined' && typeof config.analytics?.id !== 'undefined') {
    window.gtag('config', config.analytics.id, {
      page_path: url,
    });
  }
};

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
