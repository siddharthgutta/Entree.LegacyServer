/**
 * Created by kfu on 4/28/16.
 */

import {GooglePlaces, GoogleMapsGeocoding, GoogleURLShortener} from '../../libs/google/api.es6';
import config from 'config';

const googleApiKey = config.get('Google.apiKey');

const googlePlaces = new GooglePlaces(googleApiKey);
const googleMapsGeocoding = new GoogleMapsGeocoding(googleApiKey);
const googleUrlShortener = new GoogleURLShortener(googleApiKey);

/**
 * Get location coordinates from zipcode
 *
 * @param {String} zipcode: zipcode
 * @returns {Object} location object containing keys: lat, lng
 */
export async function getLocationCoordinatesFromZipcode(zipcode) {
  return await googleMapsGeocoding.getLocationFromZipcode(zipcode);
}

/**
 * Get search results of Google places by keyword
 *
 * @param {String} keyword: keyword to search by
 * @param {Number} lat: latitude coordinates
 * @param {Number} lng: longitude coordinates
 * @returns {Array} results of places
 */
export async function searchPlacesByKeyword(keyword, lat, lng) {
  return await googlePlaces.searchByKeyword(keyword, lat, lng);
}

/**
 * Get search results of Google places by name
 *
 * @param {String} name: name to search by
 * @param {Number} lat: latitude coordinates
 * @param {Number} lng: longitude coordinates
 * @returns {Array} results of places
 */
export async function searchPlacesByName(name, lat, lng) {
  return await googlePlaces.searchByName(name, lat, lng);
}

/**
 * Get place details for a Google place by the place id
 *
 * @param {String} placeid: place id for a Google place
 * @returns {Object} resulting details of a Google place
 */
export async function getPlaceDetailsFromPlaceId(placeid) {
  return await googlePlaces.details(placeid);
}

/**
 * Get a shortened url from a photo reference
 *
 * @param {String} photoReference: a google photo reference
 * @returns {String} shortened url of the photo
 */
export async function getShortUrlFromPhotoReference(photoReference) {
  const longUrl = googlePlaces.photos(photoReference);
  return await googleUrlShortener.shortenUrl(longUrl);
}

export const GooglePlacesAPI = googlePlaces;
export const GoogleMapsGeocodingAPI = googleMapsGeocoding;
export const GoogleURLShortenerAPI = googleUrlShortener;
