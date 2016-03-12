import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from 'config';

const mysqlConfig = config.get('MySQL');
const basename = path.basename(module.filename);
const db = {};
const sequelize = new Sequelize(mysqlConfig.database, mysqlConfig.username, mysqlConfig.password, {...mysqlConfig});

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    try {
      const model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    } catch (e) {
      throw new TraceError(`Failed to import ${file}`, e);
    }
  });

Object.keys(db)
      .forEach(modelName => {
        if (db[modelName].associate) {
          db[modelName].associate(db);
        }
      });

db.sequelize = sequelize;
db.transact = sequelize.transaction.bind(sequelize); // using shortname for scope fix in eslint
db.Sequelize = Sequelize;

export default db;
