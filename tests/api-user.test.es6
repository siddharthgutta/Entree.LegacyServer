import './test-init.es6'
import superagent from 'superagent'
import expect from 'expect.js'
import select from 'selectn'
import port from './port'

console.tag(__filename).log("Starting tests");

describe('Create User', ()=> {
  it('should respond to POST', done => {
    superagent
        .post(`http://localhost:${port}/api/user/create`)
        .send({username: 'jim', password: 'halpert', email: 'jhalpert@dunder.com'})
        .end((err, res) => {
          expect('jim').to.equal(select('body.data.username', res));
          expect('halpert').to.equal(select('body.data.password', res));
          expect('jhalpert@dunder.com').to.equal(select('body.data.email', res));
          console.tag(TEST).log(res.body);
          done();
        });
  });
});