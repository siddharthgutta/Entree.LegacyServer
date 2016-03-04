import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from 'config';

const mysqlConfig = config.get('MySQL');
const basename = path.basename(module.filename);
const db = {};
const sequelize = new Sequelize(mysqlConfig.database, mysqlConfig.username, mysqlConfig.password, mysqlConfig);

/* This is for whenver we update schema, need to create a better solution
* We need to only run when not staging (aka not tests are running) since the tests
* individually sync the database and if you do it here there are problems */
/* if (process.env.NODE_ENV !== 'staging') {
  sequelize.query('SET FOREIGN_KEY_CHECKS=0')
    .then(() => sequelize.sync({force: true}))
    .then(() => sequelize.query('SET FOREIGN_KEY_CHECKS=1'));
} */
// TODO logging => console.tag('sequelize').bind(console)

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db)
      .forEach(modelName => {
        if (db[modelName].associate) {
          db[modelName].associate(db);
        }
      });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
