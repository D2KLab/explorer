import NextAuth from 'next-auth/client';
import { MongoClient } from 'mongodb';

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

  res.status(200).json({ ...user });
};
