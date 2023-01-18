import { ObjectId } from 'mongodb';
import { unstable_getServerSession } from 'next-auth';

import { withRequestValidation } from '@helpers/api';
import { getListById, getSessionUser, getUserById, updateList } from '@helpers/database';
import { authOptions } from '@pages/api/auth/[...nextauth]';

/**
 * List collaborators operations. Takes in a list id and a collaborator id.
 * If method is POST or PUT, adds the collaborator to the list.
 * If method is DELETE, deletes the collaborator from a list given the id of the list and the id of the collaborator.
 * @param {string} listId - the id of the list to get.
 * @param {string} collaboratorId - the id of the collaborator.
 */
export default withRequestValidation({
  allowedMethods: ['POST', 'PUT', 'DELETE'],
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

  const collaborators = [];
  for (let i = 0; i < list.collaborators.length; i += 1) {
    const collaborator = await getUserById(list.collaborators[i]);
    collaborators.push({ _id: collaborator._id.toString(), name: collaborator.name });
  }

  const collaboratorId = req.query.collaboratorId;

  // Update collaborators
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!collaborators.some((id) => id.toString() === collaboratorId)) {
      collaborators.push(new ObjectId(collaboratorId));
      await updateList(list, {
        collaborators,
      });
    }
  } else if (req.method === 'DELETE') {
    collaborators.splice(
      collaborators.findIndex((id) => id.toString() === collaboratorId),
      1
    );
    await updateList(list, { collaborators });
  }

  // Return collaborators
  res.status(200).json(collaborators);
});
