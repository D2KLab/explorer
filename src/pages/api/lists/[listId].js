import NextAuth from 'next-auth/client';

import {
  getListById,
  getSessionUser,
  removeItemFromList,
  addItemToList,
  removeUserList,
} from '@helpers/database';

export default async (req, res) => {
  const list = await getListById(req.query.listId);

  if (!list) {
    res.statusCode = 404;
    res.json({
      error: {
        status: 404,
        message: 'List not found',
      },
    });
    return;
  }

  // Get user informations
  const session = await NextAuth.session({ req });
  const user = await getSessionUser(session);

  const isOwner = user && list && list.user.equals(user._id);

  if (req.method === 'GET') {
    res.status(200).json(list);

    if (!list.is_public && !isOwner) {
      res.statusCode = 403;
      res.json({
        error: {
          status: 403,
          message: 'Forbidden',
        },
      });
      return;
    }
  }

  // Owner operations
  if (!isOwner) {
    res.statusCode = 403;
    res.json({
      error: {
        status: 403,
        message: 'Forbidden',
      },
    });
    return;
  }

  if (req.method === 'PUT') {
    // Update the list
    const body = JSON.parse(req.body);
    const inList = list.items.includes(body.item);
    const updatedList = inList
      ? await removeItemFromList(body.item, list)
      : addItemToList(body.item, list);
    res.status(200).json(updatedList);
  } else if (req.method === 'DELETE') {
    // Delete the list
    await removeUserList(user, list);
    res.status(200).json({});
  }
};
