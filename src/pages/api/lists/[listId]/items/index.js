import { withRequestValidation } from '@helpers/api';
import { addItemsToList, getListById, getSessionUser } from '@helpers/database';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';

/**
 * List item operations. Takes in a list id.
 * If method is PUT, adds the item given the uri into the list given the id.
 * @param {string} listId - the id of the list to get.
 * @param {string} itemUri - the uri of the item to get.
 */
export default withRequestValidation({
  allowedMethods: ['PUT'],
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
      await addItemsToList(items, body.type, list);
    }
  }

  const updatedList = await getListById(list._id);
  res.status(200).json(updatedList);
});
