/**
 * Created by kfu on 4/21/16.
 */

import GoogleAPIStrategy from './strategy.es6';

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
   * @returns {*}: results with a list of places and their data
   */
  async searchByKeyword(keyword, lat, long) {
    const responseBody = await this.apiCall(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      'GET', {
        key: this.apiKey,
        keyword,
        opennow: true,
        // 16km ~ 10 mile radius
        radius: 16000,
        location: `${lat},${long}`
      }
    );
    return responseBody.results;
  }

  /**
   * Search for places by name
   *
   * @param {String} name: name of place to search by
   * @param {Number} lat: latitude coordinate value
   * @param {Number} long: longitude coordinate value
   * @returns {*}: results with a list of places and their data
   */
  async searchByName(name, lat, long) {
    const responseBody = await this.apiCall(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      'GET', {
        key: this.apiKey,
        name,
        opennow: true,
        // 16km ~ 10 mile radius
        radius: 16000,
        location: `${lat},${long}`
      }
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
   * @returns {*}: image result url
   */
  async photos(photoreference) {
    const responseBody = await this.apiCall(
      'https://maps.googleapis.com/maps/api/place/photo',
      'GET', {
        photoreference,
        // Get highest resolution image possible
        maxHeight: 1600,
        key: this.apiKey}
    );
    return responseBody;
  }
}
