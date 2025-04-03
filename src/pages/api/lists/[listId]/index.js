import { getServerSession } from 'next-auth';

import { withRequestValidation } from '@helpers/api';
import { getListById, getSessionUser, removeUserList, updateList } from '@helpers/database';
import { authOptions } from '@pages/api/auth/[...nextauth]';

/**
 * List operations. Takes in a list id.
 * If method is GET, returns the list with the given id.
 * If method is PUT, takes in list properties and updates a list with the given id and properties.
 * If method is DELETE, deletes the list with the given id.
 * @param {string} listId - the id of the list to get.
 */
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
  const session = await getServerSession(req, res, authOptions);
  const user = await getSessionUser(session);

  const isOwner = user && list && list.user.equals(user._id);
  const isCollaborator = user && list?.collaborators?.some((id) => id.equals(user._id));

  if (req.method === 'GET') {
    if (!list.is_public && !isOwner) {
      res.status(403).json({
        error: {
          status: 403,
          message: 'Forbidden',
        },
      });
      return;
    }
    res.status(200).json(list);
  }

  if (req.method === 'PUT') {
    // Owner or collaborator operation
    if (!isOwner && !isCollaborator) {
      res.status(403).json({
        error: {
          status: 403,
          message: 'Forbidden',
        },
      });
      return;
    }

    // Update the list
    const body = JSON.parse(req.body);

    // List items
    const items = [].concat(body.items).filter((x) => x);
    if (items.length > 0 && body.type) {
      await updateList(list, {
        items,
      });
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
    // Owner operation
    if (!isOwner) {
      res.status(403).json({
        error: {
          status: 403,
          message: 'Forbidden',
        },
      });
      return;
    }

    // Delete the list
    await removeUserList(user, list);
    res.status(200).json({});
  }
});
