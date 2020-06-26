import queryString from 'query-string';

import config from '~/config';

const SpatioTemporalMaps = ({ query }) => {
  return (
    <div>
      <iframe
        title="Spatio Temporal Maps"
        src={`${config.plugins.spatioTemporalMaps.url}?${queryString.stringify(query)}`}
        width="100%"
        height="600"
      />
    </div>
  );
};

export default SpatioTemporalMaps;
