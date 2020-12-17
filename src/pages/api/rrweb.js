import NextAuth from 'next-auth/client';
import { ObjectID } from 'mongodb';
import cookie from 'cookie';

import { withRequestValidation } from '@helpers/api';
import { connectToDatabase, getSessionUser } from '@helpers/database';

export default withRequestValidation({
  allowedMethods: ['POST'],
})(async (req, res) => {
  const session = await NextAuth.getSession({ req });
  const user = await getSessionUser(session);
  const db = await connectToDatabase();

  if (req.body.delete) {
    await db.collection('rrweb').remove({
      captureSessionId: req.body.delete,
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
      captureSessionId: rrweb,
    },
    {
      $set: {
        captureSessionId: rrweb,
        user: user && new ObjectID(user._id),
      },
      $push: { events: { $each: events } },
    },
    {
      upsert: true,
    }
  );

  res.status(204).end();
});
