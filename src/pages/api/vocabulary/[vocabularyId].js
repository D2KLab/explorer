import { withRequestValidation } from '@helpers/api';
import { getVocabularyItems } from '@helpers/vocabulary';
import config from '~/config';

/**
 * Returns vocabulary items for a given vocabulary id.
 * correct amount of spaces to the beginning of each line.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;

  const { vocabularyId } = query;

  const vocabulary = config.vocabularies[vocabularyId];

  if (!vocabulary) {
    res.status(404).json([]);
    return;
  }

  const results = await getVocabularyItems(vocabularyId, { params: query });

  res.status(200).json(results);
});
