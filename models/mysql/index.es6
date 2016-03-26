import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from 'config';
import Instance from 'sequelize/lib/instance';
import {deprecate} from '../../libs/utils.es6';

const db = Object.create(null);
const mysqlConfig = config.get('MySQL');
const basename = path.basename(module.filename);
const database = mysqlConfig.revision ? `${mysqlConfig.database}_${mysqlConfig.revision}` : mysqlConfig.database;
const sequelize = new Sequelize(database, mysqlConfig.username, mysqlConfig.password, {...mysqlConfig, database});
const objectLookup = new WeakMap();

Sequelize.resolve = obj => {
  if (obj instanceof Instance) {
    return obj;
  } else if (!objectLookup.has(obj)) {
    throw Error('Could not resolve Sequelize object from input. Is this an object returned by Sequelize?');
  }

  return objectLookup.get(obj);
};

export async function close() {
  return sequelize.close(); // promise?
}

export async function init(clearAll = false) {
  try {
    const files = fs.readdirSync(__dirname)
                    .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'));

    for (const file of files) {
      try {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
      } catch (e) {
        throw new TraceError(`Failed to import ${file}`, e);
      }
    }

    for (const [modelName] of Object.entries(db)) {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    }

    const _get = Instance.prototype.get;

    Instance.prototype.get = function get(...args) {
      const got = _get.apply(this, args);
      if (!got || typeof got !== 'object') {
        return got;
      }

      // deprecate
      Object.defineProperty(got, 'resolve', {
        configurable: true,
        value: () => deprecate(() => Sequelize.resolve(got), 'Use index.resolve(object) instead; low priority'),
        enumerable: false
      });

      objectLookup.set(got, this);

      return got;
    };

    Instance.prototype.resolve = function resolve() {
      return deprecate(() => this, 'Use index.resolve(object) instead; low priority');
    };

    sequelize.resolve = Sequelize.resolve;
    db.sequelize = sequelize;
    db.resolve = Sequelize.resolve;
    db.transact = sequelize.transaction.bind(sequelize); // using shortname for scope fix in eslint
    db.Sequelize = Sequelize;

    if (clearAll) {
      await sequelize.query('SET UNIQUE_CHECKS = 0;');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      await sequelize.query(`SET SQL_MODE = 'traditional';`);
    }

    await sequelize.sync({force: clearAll});

    if (clearAll) {
      await sequelize.query(`SET SQL_MODE = '';`);
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      await sequelize.query('SET UNIQUE_CHECKS = 1;');
    }
  } catch (e) {
    await console.error(new TraceError(`Start error. Have you created/migrated to ${database}?`, e));
    process.exit(1);
  }
}

export async function clear() {
  await init(true);
}

export default db;
