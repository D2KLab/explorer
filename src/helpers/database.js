import { MongoClient, ObjectID } from 'mongodb';

let cachedDb = null;

export const connectToDatabase = async () => {
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
};

export const getListById = async (listId) => {
  const db = await connectToDatabase();
  return db.collection('list').findOne({ _id: new ObjectID(listId) });
};

export const updateList = async (list, newValues) => {
  const db = await connectToDatabase();
  const res = await db.collection('list').findOneAndUpdate(
    {
      _id: new ObjectID(list._id),
    },
    {
      $set: { ...newValues, updated_at: new Date() },
    },
    {
      returnNewDocument: true,
    }
  );
  return res.value;
};

export const removeItemFromList = async (itemUri, list) => {
  const db = await connectToDatabase();
  const res = await db.collection('list').findOneAndUpdate(
    {
      _id: new ObjectID(list._id),
    },
    {
      $pull: { items: itemUri },
      $set: { updated_at: new Date() },
    },
    {
      returnNewDocument: true,
    }
  );
  return res.value;
};

export const addItemToList = async (itemUri, list) => {
  const db = await connectToDatabase();
  const res = await db.collection('list').findOneAndUpdate(
    {
      _id: new ObjectID(list._id),
    },
    {
      $push: { items: itemUri },
      $set: { updated_at: new Date() },
    },
    {
      returnNewDocument: true,
    }
  );
  return res.value;
};

export const getSessionUser = async (session) => {
  if (typeof session !== 'object' || session === null || typeof session.accessToken !== 'string') {
    return null;
  }

  const db = await connectToDatabase();

  const users = await db
    .collection('user')
    .aggregate([
      {
        $lookup: {
          from: 'session',
          localField: '_id',
          foreignField: 'userId',
          as: 'session',
        },
      },
      {
        $unwind: '$session',
      },
      {
        $match: {
          'session.accessToken': {
            $eq: session.accessToken,
          },
        },
      },
      {
        $project: {
          session: 0,
        },
      },
    ])
    .toArray();

  return users.shift();
};

export const getUserLists = async (user) => {
  const db = await connectToDatabase();
  return db
    .collection('list')
    .find({ user: new ObjectID(user._id) })
    .sort({ updated_at: 1 })
    .toArray();
};

export const createUserList = async (user, list) => {
  const db = await connectToDatabase();
  const res = await db.collection('list').insertOne({
    ...list,
    user: new ObjectID(user._id),
    created_at: new Date(),
    updated_at: new Date(),
  });
  return res.ops[0];
};

export const removeUserList = async (user, list) => {
  const db = await connectToDatabase();
  return db.collection('list').remove(
    {
      _id: list._id,
      user: new ObjectID(user._id),
    },
    {
      justOne: true,
    }
  );
};

export const deleteUser = async (user) => {
  const db = await connectToDatabase();

  // Delete all user lists
  await db.collection('list').remove({
    user: new ObjectID(user._id),
  });

  // Delete user session
  await db.collection('session').remove({
    userId: new ObjectID(user._id),
  });

  // Delete user account
  await db.collection('account').remove({
    userId: new ObjectID(user._id),
  });

  // Delete user profile
  await db.collection('user').remove({
    _id: new ObjectID(user._id),
  });
};

export const getUserAccounts = async (user) => {
  const db = await connectToDatabase();

  return await db
    .collection('account')
    .find({
      userId: new ObjectID(user._id),
    })
    .toArray();
};

export const removeUserAccount = async (user, account) => {
  const db = await connectToDatabase();
  return db.collection('account').remove(
    {
      _id: account._id,
      user: new ObjectID(user._id),
    },
    {
      justOne: true,
    }
  );
};
