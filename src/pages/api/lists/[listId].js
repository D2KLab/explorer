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

  if (req.method === 'PUT') {
    // Update the list
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

    const body = JSON.parse(req.body);
    const inList = list.items.includes(body.item);
    const updatedList = (
      await db.collection('list').findOneAndUpdate(
        {
          _id: new ObjectID(list._id),
        },
        {
          [inList ? '$pull' : '$push']: { items: body.item },
        },
        {
          returnNewDocument: true,
        }
      )
    ).value;
    res.status(200).json(updatedList);
    return;
  }

  res.status(200).json(list);
};
