import { getServerSession } from 'next-auth';

import { authOptions } from '../auth/[...nextauth]';

import { withRequestValidation } from '@helpers/api';
import { getSessionUser, deleteUser } from '@helpers/database';

/**
 * Profile operations.
 * If method is GET, return user profile
 * If method is DELETE, deletes the user
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export default withRequestValidation({
  useSession: true,
  allowedMethods: ['GET', 'DELETE'],
})(async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  // Get user informations
  const user = await getSessionUser(session);

  if (req.method === 'GET') {
    // Return user informations
    res.status(200).json({ ...user });
  } else if (req.method === 'DELETE') {
    // Delete user account
    await deleteUser(user);
    res.status(200).json({});
  }
});
