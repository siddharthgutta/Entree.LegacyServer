import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from 'config';

const db = Object.create(null);
const mysqlConfig = config.get('MySQL');
const basename = path.basename(module.filename);
const database = mysqlConfig.revision ? `${mysqlConfig.database}_${mysqlConfig.revision}` : mysqlConfig.database;
const sequelize = new Sequelize(database, mysqlConfig.username, mysqlConfig.password, {...mysqlConfig, database});

export async function close() {
  sequelize.close();
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

    db.sequelize = sequelize;
    db.transact = sequelize.transaction.bind(sequelize); // using shortname for scope fix in eslint
    db.Sequelize = Sequelize;

    if (clearAll) {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    }

    await sequelize.sync({force: clearAll});

    if (clearAll) {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  } catch (e) {
    await console.error(new TraceError(`No database! Have you migrated to ${database}?`, e));
    process.exit(1);
  }
}

export async function clear() {
  await init(true);
}

export default db;
