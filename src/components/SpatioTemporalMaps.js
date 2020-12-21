import { useMemo } from 'react';
import queryString from 'query-string';
import Cookies from 'js-cookie';

import { useTranslation } from '~/i18n';
import config from '~/config';

const SpatioTemporalMaps = ({ mapRef, query }) => {
  const { i18n } = useTranslation();

  const params = useMemo(() => {
    return {
      ...query,
      _analytics: Cookies.get('consent') === '1',
      _t: new Date().getTime(),
      _l: i18n.language,
    };
  }, [queryString.stringify(query)]);

  return (
    <div>
      <iframe
        title="Spatio Temporal Maps"
        src={`${config.plugins.spatioTemporalMaps.url}?${queryString.stringify(params)}`}
        width="100%"
        height="600"
        ref={mapRef}
      />
    </div>
  );
};

export default SpatioTemporalMaps;
