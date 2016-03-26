/**
 * Created by kfu on 3/23/16.
 */

/*
 Run
 export NODE_ENV=production
 via command line before running this script when wanting to shove this into production
 */
import * as Restaurant from '../../api/restaurant.es6';
import * as Payment from '../../api/payment.es6';
import {Mode} from '../../models/mysql/restaurant.es6';
import {isEmpty} from '../../libs/utils.es6';
import braintree from 'braintree';
import * as Runtime from '../../libs/runtime.es6';
import * as Bootstrap from '../../bootstrap.es6';
import Promise from 'bluebird';

Bootstrap.initErrorHandling();
console.log('Production: ', Runtime.isProduction());

const address = '817 West 5th St.';
const city = 'Austin';
const addrState = 'TX';
const zipcode = '78703';

const percentageFee = 5;
const transactionFee = 30;

const restaurantName = 'austinshabibi';
const restaurantPass = 'greekwraps';

// @jlmao @bluejamesbond
// It's tedious, but please compare with
// http://www.austinshabibi.com/austins-habibi-menu

const itemMods = {
  1: {
    name: 'Pita Bread',
    price: 100
  },
  2: {
    name: 'Feta Cheese',
    price: 100
  },
  3: {
    name: 'Chicken',
    price: 100
  },
  4: {
    name: 'Falafel',
    price: 100
  },
  5: {
    name: 'Gyro',
    price: 100
  },
  6: {
    name: 'Hummus',
    price: 100
  },
  7: {
    name: 'Fries',
    price: 100
  },
  8: {
    name: 'Gyro',
    price: 0
  },
  9: {
    name: 'Chicken',
    price: 0
  },
  10: {
    name: 'Falafel',
    price: 0
  }
};

const hours = [
  {
    day: 'Monday',
    open: '11:00:00',
    close: '15:00:00'
  },
  {
    day: 'Monday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Tuesday',
    open: '11:00:00',
    close: '15:00:00'
  },
  {
    day: 'Tuesday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Wednesday',
    open: '11:00:00',
    close: '15:00:00'
  },
  {
    day: 'Wednesday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Thursday',
    open: '11:00:00',
    close: '15:00:00'
  },
  {
    day: 'Thursday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Friday',
    open: '11:00:00',
    close: '15:00:00'
  },
  {
    day: 'Friday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Saturday',
    open: '11:00:00',
    close: '22:00:00'
  },
  {
    day: 'Sunday',
    open: '11:00:00',
    close: '22:00:00'
  }
];

const menu = [
  {
    category: 'Wraps',
    items: [
      {
        name: 'Gyro Wrap',
        description: 'lamb, lettuce, tomatoes',
        basePrice: 700,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[6], itemMods[7], itemMods[2], itemMods[4], itemMods[3]
            ],
            min: 0,
            max: 5
          }
        ]
      }, {
        name: 'Chicken Wrap',
        description: 'chicken, lettuce, tomatoes',
        basePrice: 700,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[6], itemMods[7], itemMods[2], itemMods[4]
            ],
            min: 0,
            max: 4
          }
        ]
      }, {
        name: 'Falafel Wrap',
        description: 'falafel, lettuce',
        basePrice: 700,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[6], itemMods[7], itemMods[2], itemMods[5]
            ],
            min: 0,
            max: 4
          }
        ]
      }
    ]
  },
  {
    category: 'Sides & Appetizers',
    items: [
      {
        name: 'Hummus',
        description: 'with pita bread',
        basePrice: 500,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [itemMods[1]],
            min: 0,
            max: 1
          }
        ]
      }, {
        name: 'Fries',
        description: 'with habibi sauce',
        basePrice: 400,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[6], itemMods[7], itemMods[2], itemMods[5], itemMods[3]
            ],
            min: 0,
            max: 5
          }
        ]
      }, {
        name: 'Falafel Snack',
        description: '4 falafel patties',
        basePrice: 500,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [itemMods[1]],
            min: 0,
            max: 1
          }
        ]
      }
    ]
  },
  {
    category: 'Salads',
    items: [
      {
        name: 'Gyro Salad',
        description: '',
        basePrice: 900,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [itemMods[1]],
            min: 0,
            max: 1
          }
        ]
      }, {
        name: 'Combo Salad',
        description: '',
        basePrice: 900,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [itemMods[1]],
            min: 0,
            max: 1
          }
        ]
      }, {
        name: 'Chicken Salad',
        description: '',
        basePrice: 900,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [itemMods[1]],
            min: 0,
            max: 1
          }
        ]
      }, {
        name: 'Greek Salad',
        description: '',
        basePrice: 900,
        modTypes: [
          {
            name: 'Meat',
            mods: [itemMods[8], itemMods[9], itemMods[10]],
            min: 0,
            max: 1
          },
          {
            name: 'Add-ons',
            mods: [itemMods[1]],
            min: 0,
            max: 1
          }
        ]
      }
    ]
  },
  {
    category: 'Plates',
    items: [
      {
        name: 'Gyro Plate',
        description: 'lamb, rice, salad',
        basePrice: 900,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[1]
            ],
            min: 0,
            max: 1
          }
        ]
      }, {
        name: 'Chicken Plate',
        description: 'chicken, rice, salad',
        basePrice: 900,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[1]
            ],
            min: 0,
            max: 1
          }
        ]
      }, {
        name: 'Combo Plate',
        description: 'lamb, chicken, rice, salad',
        basePrice: 900,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[1]
            ],
            min: 0,
            max: 1
          }
        ]
      }, {
        name: 'Veggie Plate',
        description: 'falafel, hummus, rice, salad',
        basePrice: 900,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[1]
            ],
            min: 0,
            max: 1
          }
        ]
      }, {
        name: 'Falafel Plate',
        description: 'falafel, rice, salad',
        basePrice: 900,
        modTypes: [
          {
            name: 'Add-ons',
            mods: [
              itemMods[1]
            ],
            min: 0,
            max: 1
          }
        ]
      }
    ]
  }
];

const merchant = {
  individual: {
    firstName: Runtime.isProduction() ? 'Ali' : braintree.Test.MerchantAccountTest.Approve,
    lastName: 'Alabudi',
    email: 'austinshabibi@gmail.com',
    phone: '5127334014',
    dateOfBirth: '1988-05-05',
    address: {
      streetAddress: '817 West 5th St.',
      locality: 'Austin',
      region: 'TX',
      postalCode: '78703'
    }
  },
  business: {
    dbaName: 'Austin\'s Habibi'
  },
  funding: {
    destination: braintree.MerchantAccount.FundingDestination.Bank,
    accountNumber: '1800900774646',
    routingNumber: '314977405'
  }
};

let restaurantId;

async function importMenu() {
  console.log('Importing Menu');
  try {
    const restaurant = (await Restaurant.create(restaurantName, restaurantPass, Mode.REGULAR)).resolve();
    restaurantId = restaurant.id;
    await Restaurant.update(restaurantId, {percentageFee, transactionFee});
    await Promise.each(menu, async menuCategory => {
      const category = await restaurant.insertCategory(menuCategory.category);
      await Promise.each(menuCategory.items, async menuItem => {
        const item = await category.insertMenuItem(menuItem.name, menuItem.description, menuItem.basePrice);
        if (!isEmpty(menuItem.modTypes)) {
          await Promise.each(menuItem.modTypes, async menuModType => {
            const itemMod = await item.upsertItemMod(menuModType.name, menuModType.min, menuModType.max);
            await Promise.each(menuModType.mods, async menuItemMod => {
              itemMod.upsertMod(menuItemMod.name, menuItemMod.price);
            });
          });
        }
      });
    });
    await restaurant.upsertLocation(address, city, addrState, zipcode);
    await Promise.each(hours, async ({day, open, close}) => {
      await restaurant.addHour(day, open, close);
    });
  } catch (err) {
    console.log(err);
    throw new TraceError('Failed to import menu', err);
  }
}

async function registerRestaurant() {
  console.log('Registering Restaurant');
  try {
    await Payment.registerRestaurantWithPaymentSystem(restaurantId,
      merchant.individual, merchant.business, merchant.funding);
  } catch (err) {
    throw new TraceError('Failed to register restaurant', err);
  }
}

Bootstrap.initDatabase().then(async () => {
  try {
    await importMenu();
    await registerRestaurant();
  } catch (err) {
    console.log(err);
  } finally {
    Bootstrap.disconnectDatabase();
  }
});
