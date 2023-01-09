import { STATUS_CODES } from 'http';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@pages/api/auth/[...nextauth]';

/**
 * A class that represents an HTTP error.
 * @param {number} code - the HTTP status code of the error.
 * @param {string} [message] - the message of the error.
 * @param {object} [extras] - any extra information to be added to the error.
 */
export class HTTPError extends Error {
  constructor(code, message, extras) {
    super(message || STATUS_CODES[code]);
    if (arguments.length >= 3 && extras) {
      Object.assign(this, extras);
    }
    this.statusCode = code;
  }
}

/**
 * Validates the request.
 * @param {NextRequest} req - the request object
 * @param {NextResponse} res - the response object
 * @param {object} [options={}] - the options object
 * @param {boolean} [options.useSession=false] - whether to use session
 * @param {string[]} [options.allowedMethods] - the allowed methods
 * @returns None
 * @throws {HTTPError} - an HTTP error
 */
export async function validateRequest(req, options = {}) {
  if (options.useSession === true) {
    // Check for a valid session
    let sessionToken = await getToken({ req });
    if (!sessionToken) {
      throw new HTTPError(403, 'Session not found');
    }
  }

  // Check if the method is allowed to be used in this context.
  if (typeof options.allowedMethods !== 'undefined') {
    const allowedMethods = Array.isArray(options.allowedMethods)
      ? options.allowedMethods
      : [options.allowedMethods].filter((x) => x);
    if (!allowedMethods.map((v) => v.toLowerCase()).includes(req.method.toLowerCase())) {
      throw new HTTPError(405, 'Method not allowed');
    }
  }
}

/**
 * Takes in a request and response and validates the request.
 * @param {NextRequest} req - the request object
 * @param {NextResponse} res - the response object
 * @param {object} options - the options object
 * @returns the validated request
 */
export function withRequestValidation(options = {}) {
  return function Extend(WrappedFunction) {
    return async (req, res) =>
      validateRequest(req, options)
        .then(() => WrappedFunction(req, res))
        .catch((err) => {
          const statusCode = err.statusCode || 500;
          const error = {
            status: err.statusCode,
            message: err.message,
          };
          if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
            error.stack = err.stack;
          }
          res.status(statusCode).json({
            error,
          });
        });
  };
}
