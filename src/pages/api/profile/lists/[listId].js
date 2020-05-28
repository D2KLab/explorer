import NextAuth from 'next-auth/client';
import { MongoClient, ObjectID } from 'mongodb';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    // Using existing connection
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(process.env.MONGODB_URI, {
    native_parser: true,
    useUnifiedTopology: true,
  })
    .then((client) => {
      cachedDb = client.db();
      return cachedDb;
    })
    .catch((error) => {
      console.log('Mongo connect Error');
      console.log(error);
    });
}

export default async (req, res) => {
  const session = await NextAuth.session({ req });

  if (!session) {
    res.statusCode = 403;
    res.json({
      error: {
        status: 403,
        message: 'Session not found',
      },
    });
    return;
  }

  // Connect to database
  const db = await connectToDatabase();

  // Get user informations
  const user = await db.collection('user').findOne({ email: session.user.email });

  const list = await db
    .collection('list')
    .findOne({ _id: new ObjectID(req.query.listId), user: new ObjectID(user._id) });

  if (!list) {
    res.statusCode = 400;
    res.json({
      error: {
        status: 400,
        message: 'List not found',
      },
    });
    return;
  }

  if (req.method === 'PUT') {
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
