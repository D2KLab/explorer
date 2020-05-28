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

  if (req.method === 'GET') {
    // Get user lists
    const lists = await db
      .collection('list')
      .find({ user: new ObjectID(user._id) })
      .toArray();
    res.status(200).json(lists);
  } else if (req.method === 'POST') {
    const body = JSON.parse(req.body);

    // Insert new list
    const list = await db.collection('list').insert({
      user: new ObjectID(user._id),
      name: body.name,
      is_public: true,
      items: [],
    });

    res.status(200).json(list);
  }
};
