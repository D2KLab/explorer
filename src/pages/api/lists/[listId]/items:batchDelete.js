import { unstable_getServerSession } from 'next-auth';

import { withRequestValidation } from '@helpers/api';
import { getListById, getSessionUser, removeItemsFromList } from '@helpers/database';
import { authOptions } from '@pages/api/auth/[...nextauth]';

/**
 * List item batch delete operation. Takes in a list id.
 * If method is POST, batch deletes an array of items from the list given the id.
 * @param {string} listId - the id of the list to get.
 */
export default withRequestValidation({
  allowedMethods: ['POST'],
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
  const session = await unstable_getServerSession(req, res, authOptions);
  const user = await getSessionUser(session);

  const isOwner = user && list && list.user.equals(user._id);
  const isCollaborator = user && list?.collaborators?.some((id) => id.equals(user._id));

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

  const { items } = JSON.parse(req.body);
  await removeItemsFromList(items, list);

  const updatedList = await getListById(list._id);
  res.status(200).json(updatedList);
});
