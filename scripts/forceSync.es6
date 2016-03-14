import Sequelize from 'sequelize';
import config from 'config';

const mysqlConfig = config.get('MySQL');
const sequelize = new Sequelize(mysqlConfig.database, mysqlConfig.username, mysqlConfig.password, {...mysqlConfig});

/* RUNNING THIS SCRIPT DROPS ALL TABLES AND RECREATES THEM
*
* DATA WILL BE LOST!!! :) */

/* This is for whenever we update schema, need to create a better solution
 * We need to only run when not staging (aka not tests are running) since the tests
 * individually sync the database and if you do it here there are problems */

sequelize.query('SET FOREIGN_KEY_CHECKS=0')
.then(() => sequelize.sync({force: true}))
.then(() => sequelize.query('SET FOREIGN_KEY_CHECKS=1'));
