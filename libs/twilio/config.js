const TWILIO_NUMBER = "5125200133";
const TWILIO_TEST_NUMBER = "+15005550006";

// Production Twilio API Credentials
const TWILIO_ACCOUNT_SID = "AC98c288dd56d31217abb621f81b1415e4";
const TWILIO_AUTH_TOKEN = "6325c4f809a60e8c9b390a1355f477d7";

// Test Twilio API Credentials
const TWILIO_TEST_ACCOUNT_SID = "AC170b40ecf9e378bc5b414c60801d7178";
const TWILIO_TEST_AUTH_TOKEN = "3e7ae8aebc9dc023b66ee071065089b0";

// Storing keys into config objects
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
=======
>>>>>>> removed unnecessary module.exports
export var twilio_config = {};
export var twilio_test_config = {};
=======
var twilio_config = {};
var twilio_test_config = {};
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> removed unnecessary module.exports
=======
export var twilio_config = {};
export var twilio_test_config = {};
>>>>>>> removed unnecessary module.exports
<<<<<<< HEAD
=======
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
=======
>>>>>>> removed unnecessary module.exports
=======
export var twilio_config = {};
export var twilio_test_config = {};
>>>>>>> think i fixed all of the merge conflicts/rebasing

twilio_config.accountSid = TWILIO_ACCOUNT_SID;
twilio_config.authToken = TWILIO_AUTH_TOKEN;
twilio_config.sendingNumber = TWILIO_NUMBER;

twilio_test_config.accountSid = TWILIO_TEST_ACCOUNT_SID;
twilio_test_config.authToken = TWILIO_TEST_AUTH_TOKEN;
twilio_test_config.sendingNumber = TWILIO_TEST_NUMBER;

// Functions to check that configuration exists for twilio usage.
var requiredConfig = [twilio_config.accountSid, twilio_config.authToken, twilio_config.sendingNumber];
var requiredTestConfig = [twilio_test_config.accountSid, twilio_test_config.authToken, twilio_test_config.sendingNumber];

function getConfigValue(configValue) {
  return configValue || false;
}

if (!requiredConfig.every(getConfigValue)) {
  var errorMessage =
    'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_NUMBER must be set.';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> added tagged logging
  console.tag("Twilio", "Configuration", "Production", "Error").log(errorMessage);
=======
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
=======
  console.tag("Twilio", "Configuration", "Production", "Error").log(errorMessage);
>>>>>>> added tagged logging
<<<<<<< HEAD
=======
  console.tag("Twilio", "Configuration", "Production", "Error").log(errorMessage);
=======
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
=======
>>>>>>> added tagged logging
=======
  console.tag("Twilio", "Configuration", "Production", "Error").log(errorMessage);
>>>>>>> think i fixed all of the merge conflicts/rebasing
  throw new Error(errorMessage);
}

if (!requiredTestConfig.every(getConfigValue)) {
  var errorMessage =
    'TWILIO_TEST_ACCOUNT_SID, TWILIO_TEST_AUTH_TOKEN, and TWILIO_NUMBER must be set.';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> added tagged logging
=======
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
=======
=======
>>>>>>> added tagged logging
>>>>>>> added tagged logging
  console.tag("Twilio", "Configuration", "Test", "Error").log(errorMessage);
  throw new Error(errorMessage);
}
=======
  throw new Error(errorMessage);
}
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
=======
>>>>>>> removed unnecessary module.exports

// Export configuration object
module.exports = {
  twilio_config, twilio_test_config
};
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> removed unnecessary module.exports
=======
>>>>>>> added SMS sending function and twilio config file with keys... code is not yet tested
=======
=======
>>>>>>> removed unnecessary module.exports
>>>>>>> removed unnecessary module.exports
=======
  console.tag("Twilio", "Configuration", "Test", "Error").log(errorMessage);
  throw new Error(errorMessage);
}
>>>>>>> think i fixed all of the merge conflicts/rebasing
