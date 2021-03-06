/**
 * Created by jadesym on 3/18/16.
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

const address = '2512 Rio Grande';
const city = 'Austin';
const addrState = 'TX';
const zipcode = '78705';

const percentageFee = 3.5;
const transactionFee = 30;

const restaurantName = 'Mac Daddy\'s';
const restaurantHandle = 'macdaddys';
const restaurantPass = 'cheese';

const profileImage = 'images/macdaddys.jpg';

const dayStrings = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const hours = [
  {
    day: 'Monday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Tuesday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Wednesday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Thursday',
    open: '17:00:00',
    close: '22:00:00'
  },
  {
    day: 'Friday',
    open: '17:00:00',
    close: '03:00:00'
  },
  {
    day: 'Saturday',
    open: '17:00:00',
    close: '03:00:00'
  },
  {
    day: 'Sunday',
    open: '17:00:00',
    close: '22:00:00'
  }
];

const menu = [
  {
    category: 'Recommended',
    mods: [
      {
        name: 'Extra Cheese',
        price: 100
      }, {
        name: 'Sautéed Jalapeno',
        price: 100
      }, {
        name: 'Extra Panko Crust',
        price: 100
      }, {
        name: 'Zucchini',
        price: 100
      }, {
        name: 'Roasted Garlic',
        price: 75
      }
    ],
    sizes: [
      {
        name: 'Small',
        price: 0
      }, {
        name: 'Medium',
        price: 200
      }, {
        name: 'Large',
        price: 400
      }
    ],
    items: [
      {
        name: 'The Meltdown',
        description: 'Roasted Garlic, Cayenne',
        basePrice: 400
      }, {
        name: 'The Spicy Pig',
        description: 'Maple Bacon, Jalapeno',
        basePrice: 400
      }, {
        name: 'The Funky Chunky',
        description: 'Hamburger, Onion',
        basePrice: 400
      }
    ]
  }, {
    category: 'Mac & Cheese',
    mods: [
      {
        name: 'Extra Cheese',
        price: 100
      }, {
        name: 'Sautéed Jalapeno',
        price: 100
      }, {
        name: 'Extra Panko Crust',
        price: 100
      }, {
        name: 'Zucchini',
        price: 100
      }, {
        name: 'Roasted Garlic',
        price: 75
      }
    ],
    sizes: [
      {
        name: 'Small',
        price: 0
      }, {
        name: 'Medium',
        price: 200
      }, {
        name: 'Large',
        price: 400
      }
    ],
    items: [
      {
        name: 'The Vatican',
        description: 'Sauteed Salami, Roasted Bell Peppers',
        basePrice: 400
      }, {
        name: 'The Garden',
        description: 'Gluten Free, No Pasta, Veggies',
        basePrice: 400
      }, {
        name: 'Just Mac',
        description: 'simple mac and cheese',
        basePrice: 350
      }
    ]
  }, {
    category: 'Drinks',
    items: [
      {
        name: 'Mexican Coke',
        description: '',
        basePrice: 250
      },
      {
        name: 'Topo Chico',
        description: '',
        basePrice: 250
      },
      {
        name: 'Water',
        description: '',
        basePrice: 200
      }
    ]
  }
];

const merchant = {
  individual: {
    firstName: Runtime.isProduction() ? 'Christoph' : braintree.Test.MerchantAccountTest.Approve,
    lastName: 'Terrell',
    email: 'papastoph@hotmail.com',
    phone: '4698792973',
    dateOfBirth: '1975-05-08',
    address: {
      streetAddress: '2239 Cromwell Cir 1314',
      locality: 'Austin',
      region: 'TX',
      postalCode: '78741'
    }
  },
  business: {
    dbaName: 'Mac Daddy\'s'
  },
  funding: {
    destination: braintree.MerchantAccount.FundingDestination.Bank,
    accountNumber: '706833758',
    routingNumber: '111000614'
  }
};

let restaurantId;

async function importMenu() {
  console.log('Importing Menu');
  try {
    // Find restaurant if already exists, create if doesn't exist
    let restaurant;
    try {
      restaurant = (await Restaurant.findByHandle(restaurantHandle)).resolve();
      await Restaurant.update(restaurant.id, {name: restaurantName, handle: restaurantHandle,
        password: restaurantPass, mode: Mode.REGULAR, profileImage});
    } catch (e) {
      restaurant = (await Restaurant.create(restaurantName,
        restaurantHandle, restaurantPass, Mode.REGULAR, {profileImage})).resolve();
    }
    restaurantId = restaurant.id;

    // Update restaurant percentageFee/transactionFee
    await Restaurant.update(restaurantId, {percentageFee, transactionFee});

    await Promise.each(menu, async menuCategory => {
      // Find category if already exists, create if doesn't exist
      let category;
      try {
        category = (await restaurant.findCategoryByName(menuCategory.category)).resolve();
      } catch (e) {
        category = await restaurant.insertCategory(menuCategory.category);
      }

      await Promise.each(menuCategory.items, async menuItem => {
        // Find menu item if already exists, create if doesn't exist
        let item;
        try {
          item = await category.findMenuItemByName(menuItem.name);
          item.updateFields(menuItem.description, menuItem.basePrice);
        } catch (e) {
          item = await category.insertMenuItem(menuItem.name, menuItem.description, menuItem.basePrice);
        }

        if (!isEmpty(menuCategory.sizes)) {
          const itemMod = await item.upsertItemMod('Size', 1, 1);

          await Promise.each(menuCategory.sizes, async size => {
            itemMod.upsertMod(size.name, size.price);
          });
        }
        if (!isEmpty(menuCategory.mods)) {
          const itemMod = await item.upsertItemMod('Add-ons', 0, 5);

          await Promise.each(menuCategory.mods, async mod => {
            await itemMod.upsertMod(mod.name, mod.price);
          });
        }
      });
    });
    await restaurant.upsertLocation(address, city, addrState, zipcode);

    // Removing existing hours
    await Promise.each(dayStrings, async day => {
      await restaurant.removeHours(day);
    });

    // Adding correct hours
    await Promise.each(hours, async ({day, open, close}) => {
      await restaurant.addHour(day, open, close);
    });
  } catch (err) {
    console.log(err);
    throw new TraceError('Failed to import menu', err);
  }
}

async function registerRestaurant() {
  console.log('Registering or finding existing restaurant');

  const restaurant = (await Restaurant.findOne(restaurantId)).resolve();
  if (isEmpty(restaurant.merchantId)) {
    try {
      await Payment.registerOrUpdateProducerWithPaymentSystem(restaurantId,
        merchant.individual, merchant.business, merchant.funding);
      console.log('Successfully registered/updated restaurant to merchant account');
    } catch (err) {
      throw new TraceError('Failed to register restaurant', err);
    }
  } else {
    console.log('Restaurant has already been submitted as a merchant to Braintree');
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
