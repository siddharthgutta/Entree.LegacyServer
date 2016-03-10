export default function (sequelize, DataTypes) {
  const Location = sequelize.define('Location', {
    address: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(32), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(2), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false,
      validate: {
        len: 2
      }
    },
    zipcode: {
      type: DataTypes.STRING(5), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false,
      validate: {
        len: 5
      }
    }
  }, {
    classMethods: {
      associate: db => {
        Location.belongsTo(db.Restaurant, {
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return Location;
}
