import formidable from 'formidable';

import { withRequestValidation } from '@helpers/api';
import { searchImage } from '@helpers/search';

// Disable bodyParser for API calls
export const config = {
  api: {
    bodyParser: false,
  },
};

const handleUpload = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

export default withRequestValidation({
  allowedMethods: ['POST'],
})(async (req, res) => {
  const { files } = await handleUpload(req);
  const { image } = files;
  const { uri } = req.query;

  try {
    const result = await searchImage(Array.isArray(image) ? image[0] : image || uri);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error searching image', error);
    return res.status(500).json({ error: 'Error searching image' });
  }
});
