export default function (sequelize, DataTypes) {
  const ChatState = sequelize.define('ChatState', {
    state: {
      type: DataTypes.STRING(16), // eslint-disable-line new-cap
      allowNull: false,
      validate: {
        isIn: [[/* The valid states */]]
      }
    }
    /*
    * Other attributes that we will need to maintain for each state
    * */
  }, {
    classMethods: {
      associate: models => {
        ChatState.belongsTo(models.User);

        ChatState.hasMany(models.OrderItem, {
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return ChatState;
}
