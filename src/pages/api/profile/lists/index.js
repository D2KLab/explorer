import { getServerSession } from 'next-auth';

import { withRequestValidation } from '@helpers/api';
import { getSessionUser, getUserLists, createUserList } from '@helpers/database';
import { authOptions } from '@pages/api/auth/[...nextauth]';

/**
 * Lists operation.
 * If method is GET, return lists belonging to the current user.
 * If method is POST, creates a new list for the current user.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export default withRequestValidation({
  useSession: true,
  allowedMethods: ['GET', 'POST'],
})(async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

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
});
