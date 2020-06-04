import NextAuth from 'next-auth/client';

import { getSessionUser, getUserAccounts } from '@helpers/database';

export default async (req, res) => {
  const session = await NextAuth.session({ req });

  if (!session) {
    res.status(403).json({
      error: {
        status: 403,
        message: 'Session not found',
      },
    });
    return;
  }

  // Get user
  const user = await getSessionUser(session);

  // Get user accounts
  const accounts = await getUserAccounts(user);

  res.status(200).json(accounts);
};
