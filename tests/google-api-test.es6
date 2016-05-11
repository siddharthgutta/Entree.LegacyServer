/**
 * Created by kfu on 4/28/16.
 */

import {GooglePlacesAPI, GoogleMapsGeocodingAPI, GoogleURLShortenerAPI} from '../api/controllers/google.es6';
import assert from 'assert';

describe('Google API', () => {
  let lat;
  let lng;
  let photoReference;
  let placeid;
  let longUrl;

  function placeCheck(place) {
    assert.ok(place.geometry.location.lat);
    assert.ok(place.geometry.location.lng);
    assert.ok(place.place_id);
    assert.ok(place.name);
    assert.ok(place.photos);
    assert.ok(place.price_level);
    assert.ok(place.rating);
    assert(place.types.length > 0);
  }

  function detailsCheck(place) {
    assert.ok(place.reviews);
    assert.ok(place.opening_hours.periods);
    assert(place.opening_hours.periods.length > 0);
    assert.ok(place.website);
    assert.ok(place.url);
  }

  describe('#GoogleMapsGeocodingAPI', () => {
    it('should get latitude and longitude from zipcode', async () => {
      const zipcode = '78705';
      const location = await GoogleMapsGeocodingAPI.getLocationFromZipcode(zipcode);
      assert.ok(location.lat);
      assert.ok(location.lng);
      lat = location.lat;
      lng = location.lng;
    });
  });

  describe('#GooglePlacesAPI', () => {
    it('should produce search results with keyword search', async () => {
      const keyword = 'chicken';
      const results = await GooglePlacesAPI.searchByKeyword(keyword, lat, lng);
      assert.ok(results);
      assert(results.length > 0);
      const firstPlace = results[0];
      placeCheck(firstPlace);
    });

    it('should produce search results with name search', async () => {
      const name = 'chipotle';
      const results = await GooglePlacesAPI.searchByName(name, lat, lng);
      assert.ok(results);
      assert(results.length > 0);
      const firstPlace = results[0];
      placeCheck(firstPlace);
      placeid = firstPlace.place_id;
      assert.ok(placeid);
      photoReference = firstPlace.photos[0].photo_reference;
    });

    it('should produce detailed results with placeid search', async () => {
      const result = await GooglePlacesAPI.details(placeid);
      placeCheck(result);
      detailsCheck(result);
    });

    it('should produce url of photo with photo reference', () => {
      longUrl = GooglePlacesAPI.photos(photoReference);
      assert.ok(longUrl);
    });
  });

  describe('#GoogleURLShortener', () => {
    it('should successfully shorten a url', async () => {
      const shortUrl = await GoogleURLShortenerAPI.shortenUrl(longUrl);
      assert.ok(shortUrl);
      assert(shortUrl.length < longUrl.length, 'Shortened url should be shorter than long url');
    });
  });
});
