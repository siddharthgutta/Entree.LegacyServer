/**
 * Created by kfu on 4/29/16.
 */

import google from 'googleapis';
import Promise from 'bluebird';

export default class GoogleURLShortener {
  /**
   * Constructor for GoogleURLShortener
   * Creates url shortener object
   *
   * @param {String} apiKey: Google API Key
   * @returns {GoogleURLShortener} GoogleURLShortener object
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.urlshortener = google.urlshortener({version: 'v1', auth: apiKey});
  }

  /**
   * Shortens a url
   *
   * @param {String} longUrl: input long url
   * @returns {String} a shortened url
   */
  async shortenUrl(longUrl) {
    return new Promise((resolve, reject) => {
      const params = {
        resource: {
          longUrl
        }
      };

      // Shorten url to hide the API Key
      this.urlshortener.url.insert(params, (err, response) => {
        if (err) reject(err);
        else resolve(response.id);
      });
    });
  }
}
