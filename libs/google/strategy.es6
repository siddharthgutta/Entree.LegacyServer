/**
 * Created by kfu on 4/21/16.
 */

import request from 'request';
import Promise from 'bluebird';

export default class GoogleAPIStrategy {
  /**
   * Constructor for GoogleAPIStrategy
   *
   * @param {String} apiKey: Google API Key
   * @returns {GoogleAPIStrategy} GoogleAPIStrategy object
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Conduct a google api call
   *
   * @param {String} url: url to conduct the request on
   * @param {String} method: type of request (Ex: GET, POST, etc.)
   * @param {Object} qs: query parameters
   * @param {Boolean} getResponse: return response instead of just body
   * @returns {Promise}: promise containing error or response body
   */
  apiCall(url, method, qs) {
    return new Promise((resolve, reject) => {
      request({
        url,
        method,
        qs,
        json: true
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.body.error) {
          reject(response.body.error);
        } else {
          resolve(body);
        }
      });
    });
  }
}
