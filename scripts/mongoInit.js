const mongo = new Mongo(); // eslint-disable-line no-undef

const entree = mongo.getDB('entree');
entree.dropUser('root');
entree.createUser({
  user: 'root',
  pwd: '123456',
  roles: [{role: 'userAdmin', db: 'entree'}]
});

const entreeTest = mongo.getDB('entreeTest');
entreeTest.dropUser('root');
entreeTest.createUser({
  user: 'root',
  pwd: '123456',
  roles: [{role: 'userAdmin', db: 'entreeTest'}]
});
