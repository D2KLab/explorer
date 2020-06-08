import NextAuth from 'next-auth/client';

import { getSessionUser, getUserAccounts } from '@helpers/database';
import { withRequestValidation } from '@helpers/api';

export default withRequestValidation({
  useSession: true,
  allowedMethods: ['GET'],
})(async (req, res) => {
  const session = await NextAuth.getSession({ req });

  // Get user
  const user = await getSessionUser(session);

  // Get user accounts
  const accounts = await getUserAccounts(user);

  res.status(200).json(accounts);
});
