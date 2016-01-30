import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

export function create(phoneNumber, password, optional={name: null, email: null}) {
  return models.User.create({
    phoneNumber: phoneNumber,
    password: password,
    ...optional
  });
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
