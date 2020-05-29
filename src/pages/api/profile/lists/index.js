import NextAuth from 'next-auth/client';

import { getSessionUser, getUserLists, createUserList } from '@helpers/database';

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

  if (req.method === 'GET') {
    // Get user lists
    const lists = await getUserLists(user);

    res.status(200).json(lists);
  } else if (req.method === 'POST') {
    const body = JSON.parse(req.body);

    // Insert new list
    const list = await createUserList(user, {
      name: body.name,
      is_public: true,
      items: [],
    });

    res.status(200).json(list);
  }
};
