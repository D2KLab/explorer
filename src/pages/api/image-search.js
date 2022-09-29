import fs from 'fs';
import FormData from 'form-data';
import formidable from 'formidable';
import { withRequestValidation } from '@helpers/api';
import util from 'util';

const streamPipeline = util.promisify(require('stream').pipeline);

export const config = {
  api: {
    bodyParser: false,
  },
};

export const searchImage = async (image) => {
  const formData = new FormData();

  if (typeof image === 'object' && typeof image.filepath !== 'undefined') {
    formData.append('file', fs.createReadStream(image.filepath));
  } else {
    const response = await fetch(image);
    if (!response.ok) throw new Error(`Unexpected Response: ${response.statusText}`);
    await streamPipeline(response.body, fs.createWriteStream('./placeholder.jpg'));
    formData.append('file', fs.createReadStream('./placeholder.jpg'));
  }

  const data = await (
    await fetch(`https://silknow-image-retrieval.tools.eurecom.fr/api/retrieve`, {
      method: 'POST',
      body: formData,
    })
  ).json();

  return data;
}

const handleUpload = (req) => new Promise((resolve, reject) => {
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
