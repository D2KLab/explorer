import { unstable_getServerSession } from 'next-auth';

import { withRequestValidation } from '@helpers/api';
import { search } from '@helpers/search';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import config from '~/config';

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;

  const route = config.routes[query.type];
  if (!route) {
    res
      .status(404)
      .json({ error: { message: 'Route not found' }, results: [], totalResults: 0, favorites: [] });
    return;
  }

  const session = await unstable_getServerSession(req, res, authOptions);

  const data = await search(query, session, query.hl || req.headers['accept-language']);
  res.status(200).json(data);
});
