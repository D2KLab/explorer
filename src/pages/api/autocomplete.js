import { unstable_getServerSession } from 'next-auth';

import { withRequestValidation } from '@helpers/api';
import { search } from '@pages/api/search';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import config from '~/config';

/**
 * A route that returns a list of search results based on the query string.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns None
 */
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
