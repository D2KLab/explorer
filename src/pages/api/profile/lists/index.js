import { getSessionUser, getUserLists, createUserList } from '@helpers/database';
import { withRequestValidation } from '@helpers/api';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '@pages/api/auth/[...nextauth]';

export default withRequestValidation({
  useSession: true,
  allowedMethods: ['GET', 'POST'],
})(async (req, res) => {
  const session = await unstable_getServerSession(req, res, authOptions);

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
