const { DataTypes } = require('sequelize');
const { sequelize } = require('../db')

const CouponSchema = sequelize.define('coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discount_details: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  conditioning: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  timestamps: false,
  freezeTableName: true,
}
);

module.exports = { CouponSchema };