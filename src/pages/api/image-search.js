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

  const result = await searchImage(image || uri);

  res.status(200).json(result);
});
