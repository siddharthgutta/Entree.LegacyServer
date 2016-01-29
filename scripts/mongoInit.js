process.env.NODE_CONFIG_DIR = `../config`;
var config = require('config')['mongo']

var mongo = new Mongo();
var db = mongo.getDB(config.db);

db.createUser({
  user: config.user,
  pwd: config.password,
  roles: [{role: 'userAdmin', db: config.db}]
});
