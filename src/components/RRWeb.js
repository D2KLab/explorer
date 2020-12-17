import { useEffect } from 'react';
import { record } from 'rrweb';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

const RRWeb = () => {
  useEffect(() => {
    if (typeof Cookies.get('rrweb') === 'undefined') {
      Cookies.set('rrweb', uuidv4(), { expires: 1 });
    }

    let events = [];

    const stopFn = record({
      emit(event) {
        events.push(event);
      },
    });

    function constructBody() {
      return {
        pathname: window.location.pathname,
        search: window.location.search,
        events,
      };
    }

    function save() {
      const body = constructBody();
      events = [];
      fetch('/api/rrweb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }

    window.onunload = () => {
      if (!navigator.sendBeacon) return;

      const body = constructBody();
      const headers = {
        type: 'application/json',
      };
      const blob = new Blob([JSON.stringify(body)], headers);

      navigator.sendBeacon('/api/rrweb', blob);
    };

    setInterval(save, 10 * 1000);

    return () => {
      if (typeof stopFn === 'function') {
        stopFn();
      }
    };
  }, []);

  return null;
};

export default RRWeb;
