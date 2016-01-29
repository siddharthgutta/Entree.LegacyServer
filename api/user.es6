import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

export function create(attributes) {
  return models.User.create(attributes);
}

export function update(phoneNumber, attributes) {
  return models.User.update(
    attributes,
    {
      where: {
        phoneNumber: phoneNumber
      }
    }
  );
}

export function destroy(phoneNumber) {
  return models.User.destroy({
    where: {
      phoneNumber: phoneNumber
    }
  });
}

export function findOne(phoneNumber) {
  return models.User.findOne({
    where: {
      phoneNumber: phoneNumber
    }
  });
}
