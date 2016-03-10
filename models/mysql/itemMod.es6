export default function (sequelize, DataTypes) {
  const ItemMod = sequelize.define('ItemMod', {
    name: {
      type: DataTypes.STRING(16), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    addPrice: {
      type: DataTypes.INTEGER, // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: db => {
        ItemMod.belongsTo(db.MenuItem, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return ItemMod;
}
