/**
 * Created by kfu on 4/11/16.
 */

/*
 Run
 export NODE_ENV=production
 via command line before running this script when wanting to shove this into production
 */
import * as Restaurant from '../../api/restaurant.es6';
import {Mode} from '../../models/mysql/restaurant.es6';
import {isEmpty} from '../../libs/utils.es6';
import * as Runtime from '../../libs/runtime.es6';
import * as Bootstrap from '../../bootstrap.es6';
import Promise from 'bluebird';

Bootstrap.initErrorHandling();
console.log('Production: ', Runtime.isProduction());

const address = '2201 Speedway';
const city = 'Austin';
const addrState = 'TX';
const zipcode = '78712';

const percentageFee = 0;
const transactionFee = 0;

const restaurantName = 'Chick-Fil-A SAC';
const restaurantHandle = 'chicken';
const restaurantPass = 'startuptest';

const profileImage = 'images/chickfilasactest.jpg';

// @jlmao @bluejamesbond
// Check prices with THIS:
// https://paper.dropbox.com/doc/Chick-fil-a-Test-Run-Menu-c9GbyDcp18d8zA4maSsTT

const itemMods = {
  nuggets: {
    count8: {
      meal: {
        name: 'Nuggets (8 ct.)',
        price: 0
      },
      item: {
        name: 'Nuggets (8 ct.)',
        price: 0
      }
    },
    count12: {
      meal: {
        name: 'Nuggets (12 ct.)',
        price: 160
      },
      item: {
        name: 'Nuggets (12 ct.)',
        price: 160
      }
    }
  },
  fries: {
    large: {
      meal: {
        name: 'Large Fries',
        price: 24
      },
      item: {
        name: 'Large',
        price: 199
      }
    },
    regular: {
      meal: {
        name: 'Regular Fries',
        price: 0
      },
      item: {
        name: 'Regular',
        price: 175
      }
    }
  },
  sandwich: {
    classic: {
      meal: {
        name: 'Classic Sandwich',
        price: 0
      },
      item: {
        name: 'Classic Sandwich',
        price: 0
      }
    },
    spicy: {
      meal: {
        name: 'Spicy Sandwich',
        price: 24
      },
      item: {
        name: 'Spicy Sandwich',
        price: 30
      }
    },
    deluxe: {
      meal: {
        name: 'Deluxe Sandwich',
        price: 30
      },
      item: {
        name: 'Deluxe Sandwich',
        price: 30
      }
    },
    spicyDeluxe: {
      meal: {
        name: 'Spicy Deluxe Sandwich',
        price: 698
      },
      item: {
        name: 'Spicy Deluxe Sandwich',
        price: 389
      }
    },
    grilled: {
      meal: {
        name: 'Grilled Sandwich',
        price: 779
      },
      item: {
        name: 'Grilled Sandwich',
        price: 479
      }
    }
  },
  drinks: {
    sweetTea: {
      meal: {
        name: 'Sweet Tea',
        price: 0
      },
      item: {
        name: 'Sweet Tea',
        price: 175
      }
    },
    unsweetenedTea: {
      meal: {
        name: 'Unsweetened Tea',
        price: 0
      },
      item: {
        name: 'Unsweetened Tea',
        price: 175
      }
    },
    lemonade: {
      meal: {
        name: 'Lemonade',
        price: 10
      },
      item: {
        name: 'Lemonade',
        price: 185
      }
    },
    dietLemonade: {
      meal: {
        name: 'Diet Lemonade',
        price: 10
      },
      item: {
        name: 'Sweet Tea',
        price: 175
      }
    },
    coke: {
      meal: {
        name: 'Coke',
        price: 0
      },
      item: {
        name: 'Coke',
        price: 175
      }
    },
    dietCoke: {
      meal: {
        name: 'Diet Coke',
        price: 0
      },
      item: {
        name: 'Diet Coke',
        price: 175
      }
    },
    sprite: {
      meal: {
        name: 'Sprite',
        price: 0
      },
      item: {
        name: 'Sprite',
        price: 175
      }
    },
    drPepper: {
      meal: {
        name: 'Dr. Pepper',
        price: 0
      },
      item: {
        name: 'Dr. Pepper',
        price: 175
      }
    },
    rootBeer: {
      meal: {
        name: 'Root Beer',
        price: 0
      },
      item: {
        name: 'Root Beer',
        price: 175
      }
    }
  },
  drinkSizes: {
    lemonade: {
      medium: {
        name: 'Medium Drink Size',
        price: 0
      },
      large: {
        name: 'Large Drink Size',
        price: 40
      }
    },
    item: {
      lemonade: {
        medium: {
          name: 'Medium',
          price: 0
        },
        large: {
          name: 'Large',
          price: 40
        }
      },
      normalDrink: {
        medium: {
          name: 'Medium',
          price: 0
        },
        large: {
          name: 'Large',
          price: 20
        }
      }
    },
    normalDrink: {
      medium: {
        name: 'Medium Drink Size',
        price: 0
      },
      large: {
        name: 'Large Drink Size',
        price: 20
      }
    }
  },
  sauces: {
    chickFilASauce: {
      name: 'Chick-Fil-A Sauce',
      price: 0
    },
    ketchup: {
      name: 'Ketchup',
      price: 0
    },
    honeyMustard: {
      name: 'Honey Mustard',
      price: 0
    },
    bbqSauce: {
      name: 'Barbecue',
      price: 0
    },
    ranch: {
      name: 'Buttermilk Ranch',
      price: 0
    },
    honeyRoastedBBQ: {
      name: 'Honey Roasted BBQ',
      price: 0
    },
    polynesian: {
      name: 'Polynesian',
      price: 0
    },
    buffalo: {
      name: 'Buffalo',
      price: 0
    }
  }
};

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
    day: 'Tuesday',
    open: '11:00:00',
    close: '13:00:00'
  }
];

const menu = [
  {
    category: 'Combo',
    items: [
      {
        name: 'Nuggets (8 ct.)',
        description: '',
        basePrice: 635,
        modTypes: [
          {
            name: 'Waffle Fries',
            mods: [
              itemMods.fries.regular.meal,
              itemMods.fries.large.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drinks',
            mods: [
              itemMods.drinks.sweetTea.meal,
              itemMods.drinks.unsweetenedTea.meal,
              itemMods.drinks.lemonade.meal,
              itemMods.drinks.dietLemonade.meal,
              itemMods.drinks.coke.meal,
              itemMods.drinks.dietCoke.meal,
              itemMods.drinks.sprite.meal,
              itemMods.drinks.drPepper.meal,
              itemMods.drinks.rootBeer.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drink Size',
            mods: [
              itemMods.drinkSizes.normalDrink.medium,
              itemMods.drinkSizes.normalDrink.large
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Nuggets (12 ct.)',
        description: '',
        basePrice: 795,
        modTypes: [
          {
            name: 'Waffle Fries',
            mods: [
              itemMods.fries.regular.meal,
              itemMods.fries.large.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drinks',
            mods: [
              itemMods.drinks.sweetTea.meal,
              itemMods.drinks.unsweetenedTea.meal,
              itemMods.drinks.lemonade.meal,
              itemMods.drinks.dietLemonade.meal,
              itemMods.drinks.coke.meal,
              itemMods.drinks.dietCoke.meal,
              itemMods.drinks.sprite.meal,
              itemMods.drinks.drPepper.meal,
              itemMods.drinks.rootBeer.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drink Size',
            mods: [
              itemMods.drinkSizes.normalDrink.medium,
              itemMods.drinkSizes.normalDrink.large
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Classic Sandwich',
        description: '',
        basePrice: 635,
        modTypes: [
          {
            name: 'Waffle Fries',
            mods: [
              itemMods.fries.regular.meal,
              itemMods.fries.large.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drinks',
            mods: [
              itemMods.drinks.sweetTea.meal,
              itemMods.drinks.unsweetenedTea.meal,
              itemMods.drinks.lemonade.meal,
              itemMods.drinks.dietLemonade.meal,
              itemMods.drinks.coke.meal,
              itemMods.drinks.dietCoke.meal,
              itemMods.drinks.sprite.meal,
              itemMods.drinks.drPepper.meal,
              itemMods.drinks.rootBeer.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drink Size',
            mods: [
              itemMods.drinkSizes.normalDrink.medium,
              itemMods.drinkSizes.normalDrink.large
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Spicy Sandwich',
        description: '',
        basePrice: 659,
        modTypes: [
          {
            name: 'Waffle Fries',
            mods: [
              itemMods.fries.regular.meal,
              itemMods.fries.large.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drinks',
            mods: [
              itemMods.drinks.sweetTea.meal,
              itemMods.drinks.unsweetenedTea.meal,
              itemMods.drinks.lemonade.meal,
              itemMods.drinks.dietLemonade.meal,
              itemMods.drinks.coke.meal,
              itemMods.drinks.dietCoke.meal,
              itemMods.drinks.sprite.meal,
              itemMods.drinks.drPepper.meal,
              itemMods.drinks.rootBeer.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drink Size',
            mods: [
              itemMods.drinkSizes.normalDrink.medium,
              itemMods.drinkSizes.normalDrink.large
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Deluxe Sandwich',
        description: '',
        basePrice: 665,
        modTypes: [
          {
            name: 'Waffle Fries',
            mods: [
              itemMods.fries.regular.meal,
              itemMods.fries.large.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drinks',
            mods: [
              itemMods.drinks.sweetTea.meal,
              itemMods.drinks.unsweetenedTea.meal,
              itemMods.drinks.lemonade.meal,
              itemMods.drinks.dietLemonade.meal,
              itemMods.drinks.coke.meal,
              itemMods.drinks.dietCoke.meal,
              itemMods.drinks.sprite.meal,
              itemMods.drinks.drPepper.meal,
              itemMods.drinks.rootBeer.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drink Size',
            mods: [
              itemMods.drinkSizes.normalDrink.medium,
              itemMods.drinkSizes.normalDrink.large
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Spicy Deluxe Sandwich',
        description: '',
        basePrice: 695,
        modTypes: [
          {
            name: 'Waffle Fries',
            mods: [
              itemMods.fries.regular.meal,
              itemMods.fries.large.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drinks',
            mods: [
              itemMods.drinks.sweetTea.meal,
              itemMods.drinks.unsweetenedTea.meal,
              itemMods.drinks.lemonade.meal,
              itemMods.drinks.dietLemonade.meal,
              itemMods.drinks.coke.meal,
              itemMods.drinks.dietCoke.meal,
              itemMods.drinks.sprite.meal,
              itemMods.drinks.drPepper.meal,
              itemMods.drinks.rootBeer.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drink Size',
            mods: [
              itemMods.drinkSizes.normalDrink.medium,
              itemMods.drinkSizes.normalDrink.large
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Grilled Sandwich',
        description: '',
        basePrice: 779,
        modTypes: [
          {
            name: 'Waffle Fries',
            mods: [
              itemMods.fries.regular.meal,
              itemMods.fries.large.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drinks',
            mods: [
              itemMods.drinks.sweetTea.meal,
              itemMods.drinks.unsweetenedTea.meal,
              itemMods.drinks.lemonade.meal,
              itemMods.drinks.dietLemonade.meal,
              itemMods.drinks.coke.meal,
              itemMods.drinks.dietCoke.meal,
              itemMods.drinks.sprite.meal,
              itemMods.drinks.drPepper.meal,
              itemMods.drinks.rootBeer.meal
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Drink Size',
            mods: [
              itemMods.drinkSizes.normalDrink.medium,
              itemMods.drinkSizes.normalDrink.large
            ],
            min: 1,
            max: 1
          },
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }
    ]
  }, {
    category: 'Entree',
    items: [
      {
        name: 'Nuggets (8 ct.)',
        description: '',
        basePrice: 335,
        modTypes: [
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Nuggets (12 ct.)',
        description: '',
        basePrice: 495,
        modTypes: [
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Classic Sandwich',
        description: '',
        basePrice: 335,
        modTypes: [
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Spicy Sandwich',
        description: '',
        basePrice: 365,
        modTypes: [
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Deluxe Sandwich',
        description: '',
        basePrice: 365,
        modTypes: [
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Spicy Deluxe Sandwich',
        description: '',
        basePrice: 389,
        modTypes: [
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }, {
        name: 'Grilled Sandwich',
        description: '',
        basePrice: 479,
        modTypes: [
          {
            name: 'Sauces',
            mods: [
              itemMods.sauces.chickFilASauce,
              itemMods.sauces.ketchup,
              itemMods.sauces.honeyMustard,
              itemMods.sauces.bbqSauce,
              itemMods.sauces.ranch,
              itemMods.sauces.honeyRoastedBBQ,
              itemMods.sauces.polynesian,
              itemMods.sauces.buffalo
            ],
            min: 0,
            max: 3
          }
        ]
      }
    ]
  }, {
    category: 'Fries',
    items: [
      {
        name: 'Regular Waffle Fries',
        description: '',
        basePrice: 175,
        modTypes: [
        ]
      }, {
        name: 'Large Waffle Fries',
        description: '',
        basePrice: 199,
        modTypes: [
        ]
      }
    ]
  }, {
    category: 'Drink',
    items: [
      {
        name: 'Sweet Tea',
        description: '',
        basePrice: 175,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.normalDrink.medium,
              itemMods.drinkSizes.item.normalDrink.large
            ],
            min: 1,
            max: 1
          }
        ]
      }, {
        name: 'Unsweetened Tea',
        description: '',
        basePrice: 175,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.normalDrink.medium,
              itemMods.drinkSizes.item.normalDrink.large
            ],
            min: 1,
            max: 1
          }
        ]
      }, {
        name: 'Lemonade',
        description: '',
        basePrice: 185,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.lemonade.medium,
              itemMods.drinkSizes.item.lemonade.large
            ],
            min: 1,
            max: 1
          }
        ]
      }, {
        name: 'Diet Lemonade',
        description: '',
        basePrice: 185,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.lemonade.medium,
              itemMods.drinkSizes.item.lemonade.large
            ],
            min: 1,
            max: 1
          }
        ]
      }, {
        name: 'Coke',
        description: '',
        basePrice: 175,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.normalDrink.medium,
              itemMods.drinkSizes.item.normalDrink.large
            ],
            min: 1,
            max: 1
          }
        ]
      }, {
        name: 'Diet Coke',
        description: '',
        basePrice: 175,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.normalDrink.medium,
              itemMods.drinkSizes.item.normalDrink.large
            ],
            min: 1,
            max: 1
          }
        ]
      }, {
        name: 'Sprite',
        description: '',
        basePrice: 175,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.normalDrink.medium,
              itemMods.drinkSizes.item.normalDrink.large
            ],
            min: 1,
            max: 1
          }
        ]
      }, {
        name: 'Dr. Pepper',
        description: '',
        basePrice: 175,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.normalDrink.medium,
              itemMods.drinkSizes.item.normalDrink.large
            ],
            min: 1,
            max: 1
          }
        ]
      }, {
        name: 'Root Beer',
        description: '',
        basePrice: 175,
        modTypes: [
          {
            name: 'Size',
            mods: [
              itemMods.drinkSizes.item.normalDrink.medium,
              itemMods.drinkSizes.item.normalDrink.large
            ],
            min: 1,
            max: 1
          }
        ]
      }
    ]
  }
];

const merchantId = Runtime.isProduction() ? 'Entree_marketplace' : 'entree';

let restaurantId;

async function importMenu() {
  console.log('Importing Menu');
  try {
    // Find restaurant if already exists, create if doesn't exist
    let restaurant;
    try {
      restaurant = (await Restaurant.findByHandle(restaurantHandle)).resolve();
      await Restaurant.update(restaurant.id, {name: restaurantName, handle: restaurantHandle,
        password: restaurantPass, mode: Mode.REGULAR, profileImage, merchantId});
    } catch (e) {
      restaurant = (await Restaurant.create(restaurantName,
        restaurantHandle, restaurantPass, Mode.REGULAR, {profileImage, merchantId})).resolve();
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

Bootstrap.initDatabase().then(async () => {
  try {
    await importMenu();
  } catch (err) {
    console.log(err);
  } finally {
    Bootstrap.disconnectDatabase();
  }
});
