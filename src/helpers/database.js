import { ObjectId } from 'mongodb';
import clientPromise from '@helpers/mongodb';

let cachedDb = null;

/**
 * Connect to the database.
 * @returns A promise that resolves to the database.
 */
export const connectToDatabase = async () => {
  const client = await clientPromise;
  cachedDb = client.db();
  return cachedDb;
};

/**
 * Gets the list with the given id.
 * @param {string} listId - the id of the list to get
 * @returns {Promise<List | null>} - the list with the given id, or null if it doesn't exist
 */
export const getListById = async (listId) => {
  if (!ObjectId.isValid(listId)) return null;
  const db = await connectToDatabase();
  return db.collection('lists').findOne({ _id: new ObjectId(listId) });
};

/**
 * Updates the given list with the given values.
 * @param {List} list - the list to update
 * @param {object} newValues - the values to update the list with
 * @returns {List} the updated list
 */
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

/**
 * Removes an item from a list.
 * @param {string} itemUri - the URI of the item to remove from the list.
 * @param {string} itemType - the type of the item to remove from the list.
 * @param {List} list - the list to remove the item from.
 * @returns None
 */
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

/**
 * Adds an item to a list.
 * @param {string} itemUri - the URI of the item to add to the list.
 * @param {string} itemType - the type of the item to add to the list.
 * @param {List} list - the list to add the item to.
 * @returns None
 */
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

/**
 * Gets the user object from the database for the given session.
 * @param {object} session - the session object
 * @returns {object | null} - the user object from the database for the given session.
 */
export const getSessionUser = async (session) => {
  if (!session?.user?.id) {
    return null;
  }

  const db = await connectToDatabase();

  const user = await db.collection('users').findOne({ _id: ObjectId(session.user.id) });

  return user;
};

/**
 * Gets all of the lists for the given user.
 * @param {User} user - the user to get the lists for.
 * @returns {Promise<List[]>} - the list of lists for the user.
 */
export const getUserLists = async (user) => {
  const db = await connectToDatabase();
  return db
    .collection('lists')
    .find({ user: new ObjectId(user._id) })
    .sort({ updated_at: 1 })
    .toArray();
};

/**
 * Creates a new list for the given user.
 * @param {User} user - The user to create the list for.
 * @param {List} list - The list to create.
 * @returns The newly created list.
 */
export const createUserList = async (user, list) => {
  const db = await connectToDatabase();
  const res = await db.collection('lists').insertOne({
    ...list,
    user: new ObjectId(user._id),
    created_at: new Date(),
    updated_at: new Date(),
  });
  const insertedList = await getListById(res.insertedId);
  return insertedList;
};

/**
 * Removes the given list from the given user's list of lists.
 * @param {User} user - the user to remove the list from.
 * @param {List} list - the list to remove.
 * @returns A WriteResult object that contains the status of the operation.
 */
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

/**
 * Deletes the user from the database.
 * @returns None
 */
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

/**
 * Gets all of the accounts for the given user.
 * @param {User} user - the user to get the accounts for.
 * @returns {Promise<Account[]>} - the accounts for the user.
 */
export const getUserAccounts = async (user) => {
  const db = await connectToDatabase();

  return db
    .collection('accounts')
    .find({
      userId: new ObjectId(user._id),
    })
    .toArray();
};

/**
 * Removes the given account from the given user's account list.
 * @param {User} user - The user to remove the account from.
 * @param {Account} account - The account to remove.
 * @returns {Promise<WriteResult>} A WriteResult object that contains the status of the operation.
 */
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

/**
 * Gets all of the captures from the database.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of captures.
 */
export const getCaptures = async () => {
  const db = await connectToDatabase();
  return db.collection('rrweb').find().toArray();
};

/**
 * Gets the events from the database for the given capture session id.
 * @param {string} captureSessionId - the capture session id to get the events for.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of events for the capture session id.
 */
export const getCaptureEvents = async (captureSessionId) => {
  const db = await connectToDatabase();
  const row = await db.collection('rrweb').findOne({ capture_session_id: captureSessionId });
  return row !== null ? row.events : [];
};
