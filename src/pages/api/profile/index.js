import { getSessionUser, deleteUser } from '@helpers/database';
import { withRequestValidation } from '@helpers/api';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default withRequestValidation({
  useSession: true,
  allowedMethods: ['GET', 'DELETE'],
})(async (req, res) => {
  const session = await unstable_getServerSession(req, res, authOptions);

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
