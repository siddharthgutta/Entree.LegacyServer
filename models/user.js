import Sequelize from 'sequelize'
import sequelize from './index'

export default sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    field: 'username'
  },
  password: {
    type: Sequelize.STRING,
    field: 'password'
  },
  email: {
    type: Sequelize.STRING,
    field: 'email'
  }
}, {
  freezeTableName: true
});