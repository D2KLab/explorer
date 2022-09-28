import { ObjectId } from 'mongodb';
import clientPromise from '@helpers/mongodb';

let cachedDb = null;

export const connectToDatabase = async () => {
  const client = await clientPromise;
  cachedDb = client.db();
  return cachedDb;
};

export const getListById = async (listId) => {
  const db = await connectToDatabase();
  return db.collection('lists').findOne({ _id: new ObjectId(listId) });
};

export const updateList = async (list, newValues) => {
  const db = await connectToDatabase();
  const res = await db.collection('lists').findOneAndUpdate(
    {
      _id: new ObjectId(list._id),
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

export const removeItemFromList = async (itemUri, itemType, list) => {
  const db = await connectToDatabase();
  const res = await db.collection('lists').findOneAndUpdate(
    {
      _id: new ObjectId(list._id),
    },
    {
      $pull: { items: { uri: itemUri, type: itemType } },
      $set: { updated_at: new Date() },
    },
    {
      returnNewDocument: true,
    }
  );
  return res.value;
};

export const addItemToList = async (itemUri, itemType, list) => {
  const db = await connectToDatabase();
  const res = await db.collection('lists').findOneAndUpdate(
    {
      _id: new ObjectId(list._id),
    },
    {
      $push: { items: { uri: itemUri, type: itemType } },
      $set: { updated_at: new Date() },
    },
    {
      returnNewDocument: true,
    }
  );
  return res.value;
};

export const getSessionUser = async (session) => {
  if (!session?.user?.id) {
    return null;
  }

  const db = await connectToDatabase();

  const user = await db
    .collection('users')
    .findOne({ _id: ObjectId(session.user.id) })

  return user;
};

export const getUserLists = async (user) => {
  const db = await connectToDatabase();
  return db
    .collection('lists')
    .find({ user: new ObjectId(user._id) })
    .sort({ updated_at: 1 })
    .toArray();
};

export const createUserList = async (user, list) => {
  const db = await connectToDatabase();
  const res = await db.collection('lists').insertOne({
    ...list,
    user: new ObjectId(user._id),
    created_at: new Date(),
    updated_at: new Date(),
  });
  return res.ops[0];
};

export const removeUserList = async (user, list) => {
  const db = await connectToDatabase();
  return db.collection('lists').remove(
    {
      _id: list._id,
      user: new ObjectId(user._id),
    },
    {
      justOne: true,
    }
  );
};

export const deleteUser = async (user) => {
  const db = await connectToDatabase();

  // Delete all user lists
  await db.collection('lists').remove({
    user: new ObjectId(user._id),
  });

  // Delete user session
  await db.collection('sessions').remove({
    userId: new ObjectId(user._id),
  });

  // Delete user account
  await db.collection('accounts').remove({
    userId: new ObjectId(user._id),
  });

  // Delete user profile
  await db.collection('users').remove({
    _id: new ObjectId(user._id),
  });
};

export const getUserAccounts = async (user) => {
  const db = await connectToDatabase();

  return db
    .collection('accounts')
    .find({
      userId: new ObjectId(user._id),
    })
    .toArray();
};

export const removeUserAccount = async (user, account) => {
  const db = await connectToDatabase();
  return db.collection('accounts').remove(
    {
      _id: account._id,
      userId: new ObjectId(user._id),
    },
    {
      justOne: true,
    }
  );
};

export const getCaptures = async () => {
  const db = await connectToDatabase();
  return db.collection('rrweb').find().toArray();
};

export const getCaptureEvents = async (captureSessionId) => {
  const db = await connectToDatabase();
  const row = await db.collection('rrweb').findOne({ capture_session_id: captureSessionId });
  return row !== null ? row.events : [];
};
