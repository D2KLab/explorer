import { getServerSession } from 'next-auth';

import { withRequestValidation } from '@helpers/api';
import { getListById, getSessionUser, updateList } from '@helpers/database';
import { generateListInviteId } from '@helpers/explorer';
import { slugify } from '@helpers/utils';
import { authOptions } from '@pages/api/auth/[...nextauth]';

/**
 * Accept an invite to collaborate on a list
 * @param {string} listId - the id of the list.
 * @param {string} inviteId - the id of the invite.
 */
export default withRequestValidation({
  allowedMethods: ['POST'],
})(async (req, res) => {
  // Get current user
  const session = await getServerSession(req, res, authOptions);
  const user = await getSessionUser(session);
  if (!user) {
    // 401 Unauthorized
    res
      .status(302)
      .setHeader(
        'location',
        '/auth/signin?callbackUrl=' + encodeURIComponent(`${listUrl}/invite/${inviteId}`),
      )
      .end();
    return;
  }

  const list = await getListById(req.query.listId);
  if (!list) {
    res.status(404).send('List not found');
    return;
  }

  const listUrl = `/lists/${slugify(list.name)}-${list._id}`;
  const { inviteId } = req.body;

  if (inviteId !== generateListInviteId(list)) {
    res.status(403).send('Invalid or expired invite');
    return;
  }

  const isOwner = user && list && list.user.equals(user._id);
  if (isOwner) {
    // If the user is the owner of the list, send them back to the list page
    res.status(302).setHeader('location', listUrl).end();
    return;
  }

  const collaborators = list.collaborators || [];
  if (collaborators.some((id) => id.equals(user._id))) {
    // If the user is already a collaborator, send them back to the list page
    res.status(302).setHeader('location', listUrl).end();
    return;
  }

  // Update collaborators
  collaborators.push(user._id);
  await updateList(list, {
    collaborators,
  });

  // Redirect to the list
  res.status(302).setHeader('location', listUrl).end();
});
