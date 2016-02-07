import assert from 'assert';
import './test-init.es6';
import * as Menu from '../api/menu.es6';
import {initDatabase, destroyDatabase} from '../bootstrap.es6';

before(done => {
  initDatabase().then(() => done());
});

after(() => destroyDatabase());

describe('Menu', () => {
  if (console) {
    console.log('true');
  }

  //  const restaurantId = 1;
  //  const menu = [
  //  {
  //    category: 'Drinks',
  //    menuItems: {
  //      'Mexican Coke': {
  //        price:  2.50
  //      },
  //      'Sprite': {
  //        price: 2.50
  //      },
  //      'Orange Fanta': {
  //        price: 2.50
  //      },
  //      'Topo Chico': {
  //        price: 2.50
  //      },
  //      'Water': {
  //        price: 2.00
  //      },
  //      'Snapple Peach': {
  //        price: 2.50
  //      },
  //      'Starbucks Moca Frappuccino': {
  //        price: 2.50
  //      }
  //    }
  //  }, {
  //    category: 'Entrees',
  //    menuItems: {
  //      'The Meltdown': {
  //        description: 'Roasted Garlic + Cayenne',
  //        price: 3.50,
  //        sizes: {
  //          small: 0.00,
  //          medium: 2.00,
  //          large: 4.00
  //        }
  //      },
  //      'The Spicy Pig': {
  //        description: 'Maple Bacon + Jalapeno',
  //        price: 3.50,
  //        sizes: {
  //          small: 0.00,
  //          medium: 2.00,
  //          large: 4.00
  //        }
  //      },
  //      'The Funky Chunky': {
  //        description: 'Hamburger + Onion',
  //        price: 3.50,
  //        sizes: {
  //          small: 0.00,
  //          medium: 2.00,
  //          large: 4.00
  //        }
  //      },
  //      'The Vatican': {
  //        description: 'Sauteed Salami + Roasted Bell Peppers',
  //        price: 3.50,
  //        sizes: {
  //          small: 0.00,
  //          medium: 2.00,
  //          large: 4.00
  //        }
  //      },
  //      'The Garden': {
  //        description: 'No pasta + Sauteed Summer squash + Zucchini + Cut Jalapenos: GLUTEN FREE',
  //        price: 4.00,
  //        sizes: {
  //          small: 0.00,
  //          medium: 2.00,
  //          large: 4.00
  //        }
  //      }
  //    }
  //  }];

  describe('#create()', () => {
    it('should query from the database correctly', done => {
      Menu.getMenuByRestaurantId(1).then(menu => {
        assert.equal(menu, null);
        done();
      });
    });
  });
});
