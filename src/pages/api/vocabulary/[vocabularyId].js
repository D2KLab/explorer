import { withRequestValidation } from '@helpers/api';
import { getVocabularyItems } from '@helpers/explorer';
import config from '~/config';

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;

  const { vocabularyId } = query;

  const vocabulary = config.vocabularies[vocabularyId];

  if (!vocabulary) {
    res.statusCode = 404;
    return { props: {} };
  }

  const results = await getVocabularyItems(vocabularyId);

  res.status(200).json(results);
});
