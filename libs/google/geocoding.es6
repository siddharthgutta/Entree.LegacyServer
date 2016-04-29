/**
 * Created by kfu on 4/21/16.
 */

import GoogleAPIStrategy from './strategy.es6';

export default class GoogleMapsGeocoding extends GoogleAPIStrategy {
  /**
   * Constructor for GoogleMapsGeocoding
   *
   * @param {String} apiKey: Google API Key
   * @returns {GoogleMapsGeocoding} GoogleMapsGeocoding object
   */
  constructor(apiKey) {
    super(apiKey);
  }

  /**
   * Gets a location object from a zipcode containing longitude and latitude of a zip code
   * Ex: { "lat": 33.0787152, "lng": -96.8083063 }
   *
   * @param {String} zipcode: zipcode to get location coordinates for
   * @returns {*}: location object with lat and lng as keys
   */
  async getLocationFromZipcode(zipcode) {
    const responseBody = await this.apiCall(
      'https://maps.googleapis.com/maps/api/geocode/json',
      'GET', {address: zipcode, key: this.apiKey}
    );
    return responseBody.results[0].geometry.location;
  }
}
