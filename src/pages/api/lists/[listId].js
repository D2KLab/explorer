import NextAuth from 'next-auth/client';

import {
  getListById,
  getSessionUser,
  removeItemFromList,
  addItemToList,
  removeUserList,
  updateList,
} from '@helpers/database';
import { withRequestValidation } from '@helpers/api';

export default withRequestValidation({
  allowedMethods: ['GET', 'PUT', 'DELETE'],
})(async (req, res) => {
  const list = await getListById(req.query.listId);

  if (!list) {
    res.status(404).json({
      error: {
        status: 404,
        message: 'List not found',
      },
    });
    return;
  }

  // Get user informations
  const session = await NextAuth.getSession({ req });
  const user = await getSessionUser(session);

  const isOwner = user && list && list.user.equals(user._id);

  if (req.method === 'GET') {
    res.status(200).json(list);

    if (!list.is_public && !isOwner) {
      res.status(403).json({
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
    res.status(403).json({
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

    // List items
    if (body.item && body.type) {
      const inList = list.items.some((item) => item.uri === body.item && item.type === body.type);
      if (inList) {
        await removeItemFromList(body.item, body.type, list);
      } else {
        await addItemToList(body.item, body.type, list);
      }
    }

    // List name
    if (typeof body.name === 'string') {
      await updateList(list, {
        name: body.name,
        is_public: body.is_public,
      });
    }

    const updatedList = await getListById(list._id);
    res.status(200).json(updatedList);
  } else if (req.method === 'DELETE') {
    // Delete the list
    await removeUserList(user, list);
    res.status(200).json({});
  }
});
