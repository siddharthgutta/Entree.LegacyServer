import models from './index.es6';

export default function (sequelize, DataTypes) {
  const ChatState = sequelize.define('ChatState', {
    state: {
      type: DataTypes.STRING(16), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: db => {
        ChatState.belongsTo(db.User, {
          onDelete: 'CASCADE'
        });

        ChatState.hasMany(db.OrderItem, {
          onDelete: 'CASCADE'
        });

        ChatState.hasMany(db.CommandMap, {
          onDelete: 'CASCADE'
        });

        /* Used to main order context */
        ChatState.belongsTo(db.Restaurant);
        ChatState.belongsTo(db.MenuItem);
        ChatState.belongsTo(db.Order);
      }
    },
    instanceMethods: {
      findUser: async function() { // eslint-disable-line
        return await this.getUser();
      },
      insertCommandMap: async function (key, value) { // eslint-disable-line
        const commandMap = await models.CommandMap.create({key, value});
        await this.addCommandMap(commandMap);
        return commandMap;
      },
      clearCommandMaps: async function () { // eslint-disable-line
        return await this.setCommandMaps(null);
      },
      findCommandMaps: async function () { // eslint-disable-line
        return await this.getCommandMaps();
      },
      setRestaurantContext: async function (restaurant) { // eslint-disable-line
        await this.setMenuItem(null);
        await this.setRestaurant(restaurant);
      },
      findRestaurantContext: async function () { // eslint-disable-line
        return await this.getRestaurant();
      },
      clearRestaurantContext: async function() { // eslint-disable-line
        await this.setRestaurant(null);
      },
      setMenuItemContext: async function (item) { // eslint-disable-line
        await this.setMenuItem(item);
      },
      clearMenuItemContext: async function () { // eslint-disable-line
        await this.setMenuItem(null);
      },
      setOrderContext: async function (order) { // eslint-disable-line
        await this.setOrder(order);
      },
      findOrderContext: async function () { // eslint-disable-line
        return await this.getOrder();
      },
      clearOrderContext: async function () { // eslint-disable-line
        await this.setOrder(null);
      },
      findMenuItemContext: async function () { // eslint-disable-line
        return await this.getMenuItem();
      },
      updateState: async function (state) { // eslint-disable-line
        const tmpState = this.state;
        this.state = state;
        await this.save();

        console.log(`ChatState id ${this.id} updated from ${tmpState} to ${state}`);
        return this;
      },
      insertOrderItem: async function(name, price) { // eslint-disable-line
        const orderItem = await models.OrderItem.create({name, price});
        await this.addOrderItem(orderItem);
        return orderItem;
      },
      findOrderItems: async function () { // eslint-disable-line
        return await this.getOrderItems();
      },
      findLastOrderItem: async function() { // eslint-disable-line
        const orderItems = await this.getOrderItems({order: 'id DESC'});
        return orderItems[0];
      },
      clearOrderItems: async function() { // eslint-disable-line
        await this.setOrderItems(null);
      }
    }
  });
  return ChatState;
}
