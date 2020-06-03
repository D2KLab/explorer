import NextAuth from 'next-auth/client';

import { getSessionUser, deleteUser } from '@helpers/database';

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

  // Get user informations
  const user = await getSessionUser(session);

  if (req.method === 'GET') {
    // Return user informations
    res.status(200).json({ ...user });
  } else if (req.method === 'DELETE') {
    // Delete user account
    await deleteUser(user);
    res.status(200).json({});
    return;
  }

  res.status(405).json({
    error: {
      status: 405,
      message: 'Method not allowed',
    },
  });
};
