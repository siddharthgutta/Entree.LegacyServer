import * as Restaurant from '../api/restaurant.es6';

const address = '1234 Main Street';
const city = 'Houston';
const addrState = 'TX';
const zipcode = '48921';

const dayOfTheWeek = 'Monday';
const openTime = '11:11:11';
const closeTime = '12:34:56';

Restaurant.create('Jesse\'s Rice Palace', 'abcdefg', 'REGULAR', {phoneNumber: '1234567890'})
          .then(restaurant => {
            restaurant.insertCategory('Entree')
                      .then(category => {
                        category.insertMenuItem('Noodes', 'Spicy beef!', 500)
                                .then(item => {
                                  item.upsertSize('Large', 100);
                                  item.upsertSize('Medium', 50);
                                  item.upsertItemMod('Ranch Sauce', 200);
                                  item.upsertItemMod('BBQ', 150);
                                });
                        category.insertMenuItem('Chicken', 'Grilled chicken!', 800);
                      });
            restaurant.insertCategory('Drinks')
                      .then(category => {
                        category.insertMenuItem('Coke', 'Cold and refreshing', 200);
                      });

            restaurant.upsertLocation(address, city, addrState, zipcode);
            restaurant.addHour(dayOfTheWeek, openTime, closeTime);
          });
