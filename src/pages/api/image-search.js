import os from 'os';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import formidable from 'formidable';
import { withRequestValidation } from '@helpers/api';
import util from 'util';

/**
 * Takes in a stream and pipes it to another stream.
 * @param {stream.Readable} readable - the readable stream to pipe to the writable stream.
 * @param {stream.Writable} writable - the writable stream to pipe the readable stream to.
 * @returns None
 */
const streamPipeline = util.promisify(require('stream').pipeline);

// Disable bodyParser for API calls
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Image based search, given an uploaded image.
 * @param {object} image - the uploaded image to search for.
 */
export const searchImage = async (image) => {
  const formData = new FormData();

  if (typeof image === 'object' && typeof image.filepath !== 'undefined') {
    formData.append('file', fs.createReadStream(image.filepath));
  } else {
    const response = await fetch(image);
    if (!response.ok) throw new Error(`Unexpected Response: ${response.statusText}`);

    await new Promise((resolve, reject) => {
      let tmpDir;
      try {
        tmpDir = os.tmpdir();
        fs.mkdtemp(`${tmpDir}${path.sep}`, async (err, folder) => {
          if (err) {
            reject(err);
            return;
          }
          await streamPipeline(response.body, fs.createWriteStream(path.join(folder, 'image.jpg')));
          formData.append('file', fs.createReadStream(path.join(folder, './image.jpg')));
          resolve();
        });
      } finally {
        try {
          if (tmpDir) {
            fs.rmSync(tmpDir, { recursive: true });
          }
        } catch (e) {
          console.error(
            `An error has occurred while removing the temp folder at ${tmpDir}. Error: ${e}`
          );
        }
      }
    });
  }

  const res = await fetch(`https://silknow-image-retrieval.tools.eurecom.fr/api/retrieve`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (data.message) {
    throw new Error(data.message);
  }

  return data;
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
