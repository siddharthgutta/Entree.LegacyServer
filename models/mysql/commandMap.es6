export default function (sequelize, DataTypes) {
  const CommandMap = sequelize.define('CommandMap', {
    key: {
      type: DataTypes.INTEGER, // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    value: {
      type: DataTypes.INTEGER, // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: db => {
        CommandMap.belongsTo(db.ChatState, {
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return CommandMap;
}
