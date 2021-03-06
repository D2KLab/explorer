import NextAuth from 'next-auth/client';

import { getSessionUser, getUserAccounts, removeUserAccount } from '@helpers/database';
import { withRequestValidation } from '@helpers/api';

export default withRequestValidation({
  useSession: true,
  allowedMethods: ['GET', 'DELETE'],
})(async (req, res) => {
  const session = await NextAuth.getSession({ req });

  // Get user
  const user = await getSessionUser(session);

  // Get user accounts
  const { accountId } = req.query;
  if (typeof accountId === 'undefined' || accountId === null) {
    res.status(400).json({
      error: {
        status: 400,
        message: 'Invalid account ID',
      },
    });
    return;
  }

  const accounts = await getUserAccounts(user);

  if (req.method === 'DELETE') {
    // Unlink an account from a user profile

    if (accounts.length <= 1) {
      // Do not allow unlinking otherwise the user profile would be stuck with no accounts linked
      res.status(400).json({
        error: {
          status: 400,
          message: 'Single account cannot be unlinked',
        },
      });
      return;
    }

    const accountToUnlink = accounts.find((account) => account._id.equals(accountId));

    if (!accountToUnlink) {
      res.status(400).json({
        error: {
          status: 400,
          message: 'Account not found',
        },
      });
      return;
    }

    await removeUserAccount(user, accountToUnlink);
    res.status(200).json({});
  } else if (req.method === 'GET') {
    // Get details for an account
    const account = accounts.find((acc) => acc._id.equals(accountId));

    if (!account) {
      res.status(404).json({
        error: {
          status: 404,
          message: 'Account not found',
        },
      });
      return;
    }

    res.status(200).json(account);
  }
});
