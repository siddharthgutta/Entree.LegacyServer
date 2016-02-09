/**
 * This file must contain only this function
 *
 * Consult before modifying
 */

import request from 'superagent';

window.onerror = (error, url, line) =>  // eslint-disable-line
    request
        .post('/api/telemetry/log')
        .send({tags: ['window-error'], message: [{error, url, line}]})
        .end((err, res) => {
          if (err) return console.error(err);
          console.log(res.body.message);
        });
