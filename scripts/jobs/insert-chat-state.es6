/**
 * Created by kfu on 3/27/16.
 */

// The purpose of this script is to insert chatstate for users
// that existed before the insertion of chatstate into signup
// Certain users did not have chat states in the original signup implementation
// which causes errors for everyone who signed up before the signup insertChatState call

/*
 Run
 export NODE_ENV=production
 via command line before running this script when wanting to shove this into production
 */
import * as User from '../../api/user.es6';
import * as Runtime from '../../libs/runtime.es6';
import * as Bootstrap from '../../bootstrap.es6';
import Promise from 'bluebird';

Bootstrap.initErrorHandling();
console.log('Production: ', Runtime.isProduction());

async function insertChatStates() {
  let allUsers;
  try {
    allUsers = await User.findAll();
  } catch (findAllUsersErr) {
    console.log('Error finding all users');
    throw findAllUsersErr;
  }
  await Promise.each(allUsers, async user => {
    try {
      await user.findChatState();
    } catch (findChatStateErr) {
      console.log(`${user.id}: No chatState for - Inserting start chatState...`);
      try {
        // Tried doing this:
        // import {chatStates} from '../../libs/chat-bot/index.es6';
        // But seems like that import statement requires initializing scribe, so went without it
        await user.insertChatState('Start');
      } catch (insertChatStateErr) {
        console.log(`Failed to insert chat state for user id: ${user.id}`);
        throw insertChatStateErr;
      }
    }
  });
}
Bootstrap.initDatabase().then(async () => {
  try {
    await insertChatStates();
  } finally {
    Bootstrap.disconnectDatabase();
  }
});
