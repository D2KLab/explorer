import { getSessionUser, deleteUser } from '@helpers/database';
import { withRequestValidation } from '@helpers/api';
import { getToken } from 'next-auth/jwt';

export default withRequestValidation({
  useSession: true,
  allowedMethods: ['GET', 'DELETE'],
})(async (req, res) => {
  const token = await getToken({ req });

  // Get user informations
  const user = await getSessionUser(token);

  if (req.method === 'GET') {
    // Return user informations
    res.status(200).json({ ...user });
  } else if (req.method === 'DELETE') {
    // Delete user account
    await deleteUser(user);
    res.status(200).json({});
  }
});
