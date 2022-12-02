import { unstable_getServerSession } from 'next-auth';

import { withRequestValidation } from '@helpers/api';
import { search } from '@pages/api/search';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import config from '~/config';

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { q } = req.query;
  const { query } = req;

  const session = await unstable_getServerSession(req, res, authOptions);

  const results = await search(
    {
      type: config.search.route,
      q,
      per_page: 5,
      approximate: true,
    },
    session,
    query.hl || req.headers['accept-language']
  );

  res.status(200).json(results);
});
