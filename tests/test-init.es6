import {initScribe, initErrorHandling, initDatabase, disconnectDatabase} from '../bootstrap.es6';
import path from 'path';
import stack from 'callsite';
import config from 'config';
import ipc from '../libs/ipc.es6';

initErrorHandling();

const console = initScribe(true, true, false);

console.persistent('tags', []);
global.TEST = path.basename(stack()[7].getFileName());

const port = config.get('Server.port');
global.SERVER_URL = `https://localhost:${port}`;

export async function clearDatabase() {
  if (`${config.get('MySQL.database')}_${config.get('MySQL.revision')}` === 'entree_test'
    && config.get('MongoDb.database') === 'entree_test') {
    return await initDatabase(true); // init clears the db depending on the config
  }

  throw Error('Run the tests with NODE_ENV=staging or else you will clear the production database!');
}

export {disconnectDatabase};

export function doneAt(done, at) {
  let count = 0;

  return () => {
    if (++count === at) {
      done();
    } else {
      return count;
    }
  };
}

before(async () => initDatabase()); // auto connect since most tests atm are model stressed
after(() => ipc.disconnect());

after(async () => {
  try {
    await disconnectDatabase(); // auto disconnect databases since they automatically connect
  } catch (e) {
    // ignore
  }
}); // ensure the connections are closed
