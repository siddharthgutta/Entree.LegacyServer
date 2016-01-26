const TWILIO_NUMBER = "5125200133";

// Production Twilio API Credentials
const TWILIO_ACCOUNT_SID = "AC98c288dd56d31217abb621f81b1415e4";
const TWILIO_AUTH_TOKEN = "6325c4f809a60e8c9b390a1355f477d7";

// Test Twilio API Credentials
const TWILIO_TEST_ACCOUNT_SID = "AC170b40ecf9e378bc5b414c60801d7178";
const TWILIO_TEST_AUTH_TOKEN = "3e7ae8aebc9dc023b66ee071065089b0";

// Storing keys into config objects
export var twilio_config = {};
export var twilio_test_config = {};

twilio_config.accountSid = TWILIO_ACCOUNT_SID;
twilio_config.authToken = TWILIO_AUTH_TOKEN;
twilio_config.sendingNumber = TWILIO_NUMBER;

twilio_test_config.accountSid = TWILIO_TEST_ACCOUNT_SID;
twilio_test_config.authToken = TWILIO_TEST_AUTH_TOKEN;
twilio_test_config.sendingNumber = TWILIO_NUMBER;

// Functions to check that configuration exists for twilio usage.
var requiredConfig = [twilio_config.accountSid, twilio_config.authToken, twilio_config.sendingNumber];
var requiredTestConfig = [twilio_test_config.accountSid, twilio_test_config.authToken, twilio_test_config.sendingNumber];

function getConfigValue(configValue) {
  return configValue || false;
}

if (!requiredConfig.every(getConfigValue)) {
  var errorMessage =
    'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_NUMBER must be set.';
  throw new Error(errorMessage);
}

if (!requiredTestConfig.every(getConfigValue)) {
  var errorMessage =
    'TWILIO_TEST_ACCOUNT_SID, TWILIO_TEST_AUTH_TOKEN, and TWILIO_NUMBER must be set.';
  throw new Error(errorMessage);
}
