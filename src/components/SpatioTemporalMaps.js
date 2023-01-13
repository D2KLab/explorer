import Cookies from 'js-cookie';
import { useTranslation } from 'next-i18next';
import queryString from 'query-string';
import { useMemo } from 'react';

import config from '~/config';

/**
 * A React hook that returns the params for the Spatio Temporal Maps plugin.
 * @param {React.Ref<HTMLIFrameElement>} mapRef - The ref of the iframe that the map is rendered in.
 * @param {Query} query - The query object that is passed to the Spatio Temporal Maps plugin.
 * @returns The Spatio Temporal Maps HTML element.
 */
function SpatioTemporalMaps({ mapRef, query }) {
  const { i18n } = useTranslation();

  const params = useMemo(
    () => ({
      ...query,
      _analytics: Cookies.get('consent') === '1',
      _t: new Date().getTime(),
      _l: i18n.language,
    }),
    [queryString.stringify(query)]
  );

  return (
    <div>
      <iframe
        title="Spatio Temporal Maps"
        src={`${config.plugins?.spatioTemporalMaps.url}?${queryString.stringify(params)}`}
        width="100%"
        height="600"
        ref={mapRef}
      />
    </div>
  );
}

export default SpatioTemporalMaps;
