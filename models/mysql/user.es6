import models from './index.es6';
import {isEmpty} from '../../libs/utils.es6';

export default function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING(10), // eslint-disable-line new-cap,babel/new-cap
      allowNull: true,
      unique: true,
      validate: {
        is: /^\d{10}$/
      }
    },
    firstName: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(128), // eslint-disable-line new-cap,babel/new-cap
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    customerId: {
      type: DataTypes.STRING(36), // eslint-disable-line new-cap
      allowNull: true,
      unique: true,
      validate: {
        len: [1, 36]
      }
    },
    fbId: {
      type: DataTypes.STRING(32), // eslint-disable-line new-cap
      allowNull: true,
      unique: true
    }
  }, {
    classMethods: {
      associate: _models => {
        User.hasOne(_models.ChatState, {
          onDelete: 'CASCADE'
        });

        User.hasMany(_models.Order, {
          onDelete: 'CASCADE'
        });

        User.hasMany(_models.WishList, {
          onDelete: 'CASCADE'
        });

        User.hasMany(_models.UserLocation, {
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      insertChatState: async function (state, transaction) { // eslint-disable-line
        const chatState = await this.getChatState();
        if (chatState) {
          throw (Error(`Tried to create a chat state for ${this.phoneNumber} when one already exists`));
        }

        const newChatState = await models.ChatState.create({state}, {transaction});
        await this.setChatState(newChatState, {transaction});
        return newChatState;
      },
      findChatState: async function () { // eslint-disable-line
        const chatState = await this.getChatState();
        if (isEmpty(chatState)) {
          throw Error('Could not find chatState; empty chatState');
        }
        return chatState;
      }
    }
  });

  return User;
}
