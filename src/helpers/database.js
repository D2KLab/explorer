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
  console.log('updateList:', list, newValues);
  const db = await connectToDatabase();
  const res = await db.collection('list').findOneAndUpdate(
    {
      _id: new ObjectID(list._id),
    },
    {
      $set: { ...newValues },
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
    },
    {
      returnNewDocument: true,
    }
  );
  return res.value;
};

export const getSessionUser = async (session) => {
  if (typeof session !== 'object' || typeof session.accessToken !== 'string') {
    return Promise.reject();
  }

  const db = await connectToDatabase();

  const users = await db
    .collection('user')
    .aggregate([
      {
        $lookup: {
          from: 'session',
          localField: 'userId',
          foreignField: 'id',
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
    .toArray();
};

export const createUserList = async (user, list) => {
  const db = await connectToDatabase();
  const res = await db.collection('list').insertOne({
    user: new ObjectID(user._id),
    ...list,
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
