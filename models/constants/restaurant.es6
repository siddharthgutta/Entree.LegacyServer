import keyMirror from 'keymirror';

// @formatter:off

export const Mode = keyMirror({
  REGULAR: 'REGULAR',
  GOD: 'GOD',
  UNAVAILABLE: 'UNAVAILABLE'
});

// TODO @jesse can you add timeModes to restaurantHours?
export const TimeMode = keyMirror({
  DAY_OF_WEEK_MONDAY: null,
  DAY_OF_WEEK_WEDNESDAY: null,
  DAY_OF_WEEK_THURSDAY: null,
  DAY_OF_WEEK_FRIDAY: null,
  DAY_OF_WEEK_TUESDAY: null,
  DAY_OF_WEEK_SATURDAY: null,
  DAY_OF_WEEK_SUNDAY: null,
  FOREVER: null,
  CUSTOM: null
});

// @formatter:on
