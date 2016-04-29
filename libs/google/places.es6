/**
 * Created by kfu on 4/21/16.
 */

import GoogleAPIStrategy from './strategy.es6';
import URI from 'urijs';

export default class GooglePlaces extends GoogleAPIStrategy {
  /**
   * Constructor for GooglePlaces
   *
   * @param {String} apiKey: Google API Key
   * @returns {GooglePlaces} GooglePlaces object
   */
  constructor(apiKey) {
    super(apiKey);
  }

  /**
   * Search for places by keyword
   *
   * @param {String} keyword: keyword to search by
   * @param {Number} lat: latitude coordinate value
   * @param {Number} long: longitude coordinate value
   * @param {Boolean} opennow: search for only opennow places
   * @returns {*}: results with a list of places and their data
   */
  async searchByKeyword(keyword, lat, long, opennow = false) {
    const qs = {
      key: this.apiKey,
      keyword,
      opennow,
      // 16km ~ 10 mile radius
      radius: 16000,
      location: `${lat},${long}`
    };
    if (opennow) qs.opennow = true;

    const responseBody = await this.apiCall(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      'GET',
      qs
    );
    return responseBody.results;
  }

  /**
   * Search for places by name
   *
   * @param {String} name: name of place to search by
   * @param {Number} lat: latitude coordinate value
   * @param {Number} long: longitude coordinate value
   * @param {Boolean} opennow: search for only opennow places
   * @returns {*}: results with a list of places and their data
   */
  async searchByName(name, lat, long, opennow = false) {
    const qs = {
      key: this.apiKey,
      name,
      // 16km ~ 10 mile radius
      radius: 16000,
      location: `${lat},${long}`
    };
    if (opennow) qs.opennow = true;

    const responseBody = await this.apiCall(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      'GET',
      qs
    );
    return responseBody.results;
  }

  /**
   * Gets details of a place by its placeid
   *
   * @param {String} placeid: place id of the google place
   * @returns {*}: details result object
   */
  async details(placeid) {
    const responseBody = await this.apiCall(
      'https://maps.googleapis.com/maps/api/place/details/json',
      'GET', {placeid, key: this.apiKey}
    );
    return responseBody.result;
  }

  /**
   * Get photo by google photo reference
   *
   * @param {String} photoreference: google photo reference string
   * @returns {String}: image result url
   */
  photos(photoreference) {
    const url = new URI('https://maps.googleapis.com/maps/api/place/photo');
    url.addQuery({
      photoreference,
      maxheight: 1600,
      key: this.apiKey
    });

    return url.toString();
  }
}
