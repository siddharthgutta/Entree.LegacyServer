import models from './index.es6';

export default function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING(10), // eslint-disable-line new-cap
      allowNull: false,
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
      type: DataTypes.STRING(128), // eslint-disable-line new-cap
      allowNull: true,
      validate: {
        isEmail: true
      }
    }
  }, {
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
        return await this.getChatState();
      }
    },
    classMethods: {
      associate: _models => {
        User.hasOne(_models.ChatState, {
          onDelete: 'CASCADE'
        });

        User.hasMany(_models.Order, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return User;
}
