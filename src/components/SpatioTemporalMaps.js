import queryString from 'query-string';

import config from '~/config';

const SpatioTemporalMaps = ({ mapRef, query }) => {
  const params = { ...query, _t: new Date().getTime() };

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
