import NextAuth from 'next-auth/client';

import { getSessionUser, deleteUser } from '@helpers/database';
import { withRequestValidation } from '@helpers/api';

export default withRequestValidation({
  useSession: true,
  allowedMethods: ['GET', 'DELETE'],
})(async (req, res) => {
  const session = await NextAuth.getSession({ req });

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
