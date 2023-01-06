import { ObjectId } from 'mongodb';
import cookie from 'cookie';

import { withRequestValidation } from '@helpers/api';
import { connectToDatabase, getSessionUser } from '@helpers/database';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

/**
 * RRWeb operations.
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 */
export default withRequestValidation({
  allowedMethods: ['POST'],
})(async (req, res) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  const user = await getSessionUser(session);
  const db = await connectToDatabase();

  if (req.body.delete) {
    await db.collection('rrweb').remove({
      capture_session_id: req.body.delete,
    });
    res.status(200).end();
    return;
  }

  const cookies = cookie.parse(req.headers.cookie);

  const { rrweb } = cookies;
  if (!rrweb) {
    res.status(403).end();
    return;
  }

  const { events, pathname } = req.body;

  if (pathname.endsWith('/rrweb')) {
    // Ignore rrweb player page
    res.status(204).end();
    return;
  }

  await db.collection('rrweb').updateOne(
    {
      capture_session_id: rrweb,
    },
    {
      $set: {
        capture_session_id: rrweb,
        user: user && new ObjectId(user._id),
        updated_at: new Date(),
      },
      $setOnInsert: { created_at: new Date() },
      $push: { events: { $each: events } },
    },
    {
      upsert: true,
    }
  );

  res.status(204).end();
});
