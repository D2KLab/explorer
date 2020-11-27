import { withRequestValidation } from '@helpers/api';
import { search } from '@pages/api/search';

export default withRequestValidation({
  allowedMethods: ['POST'],
})(async (req, res) => {
  const { q } = req.body;

  const results = await search({
    type: 'object',
    q,
    per_page: 5,
    approximate: true,
  });

  res.status(200).json(results);
});
