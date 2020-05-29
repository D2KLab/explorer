import NextAuth from 'next-auth/client';

import { getSessionUser } from '@helpers/database';

export default async (req, res) => {
  const session = await NextAuth.session({ req });

  if (!session) {
    res.statusCode = 403;
    res.json({
      error: {
        status: 403,
        message: 'Session not found',
      },
    });
    return;
  }

  // Get user informations
  const user = await getSessionUser(session);

  res.status(200).json({ ...user });
};
