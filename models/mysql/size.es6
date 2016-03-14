export default function (sequelize, DataTypes) {
  const Size = sequelize.define('Size', {
    name: {
      type: DataTypes.STRING(12), // eslint-disable-line
      allowNull: false
    },
    addPrice: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: db => {
        Size.belongsTo(db.MenuItem, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return Size;
}
