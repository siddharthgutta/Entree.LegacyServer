var mongo = new Mongo();

var db = mongo.getDB('entree');
db.dropUser('root');
db.createUser({
  user: 'root',
  pwd: '123456',
  roles: [{role: 'userAdmin', db: 'entree'}]
});

var db = mongo.getDB('entree_test');
db.dropUser('root');
db.createUser({
  user: 'root',
  pwd: '123456',
  roles: [{role: 'userAdmin', db: 'entree_test'}]
});
