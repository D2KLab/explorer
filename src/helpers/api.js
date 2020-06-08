import NextAuth from 'next-auth/client';
import { STATUS_CODES } from 'http';

export class HTTPError extends Error {
  constructor(code, message, extras) {
    super(message || STATUS_CODES[code]);
    if (arguments.length >= 3 && extras) {
      Object.assign(this, extras);
    }
    this.statusCode = code;
  }
}

export async function validateRequest(req, res, options = {}) {
  if (options.useSession === true) {
    // Check for a valid session
    let session = null;
    try {
      session = await NextAuth.getSession({ req });
    } catch (e) {
      // NextAuth.getSession currently throws an error if baseUrl cookie is not defined
    }
    if (!session) {
      throw new HTTPError(403, 'Session not found');
    }
  }

  if (typeof options.allowedMethods !== 'undefined') {
    const allowedMethods = Array.isArray(options.allowedMethods)
      ? options.allowedMethods
      : [options.allowedMethods].filter((x) => x);
    if (!allowedMethods.map((v) => v.toLowerCase()).includes(req.method.toLowerCase())) {
      throw new HTTPError(405, 'Method not allowed');
    }
  }
}

export function withRequestValidation(options = {}) {
  return function Extend(WrappedFunction) {
    return async (req, res) =>
      validateRequest(req, res, options)
        .then(() => WrappedFunction(req, res))
        .catch((err) => {
          res.status(err.statusCode).json({
            error: {
              status: err.statusCode,
              message: err.message,
            },
          });
        });
  };
}
