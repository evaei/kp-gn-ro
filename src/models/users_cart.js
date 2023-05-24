"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users_carts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users_carts.hasMany(models.users_cart_items, {
        foreignKey: "cartId",
        as: "cartItems",
      });
    }
  }
  users_carts.init(
    {
      userId: DataTypes.STRING,
      itemCount: DataTypes.INTEGER,
      itemQuantityCount: DataTypes.INTEGER,
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "users_carts",
    }
  );
  return users_carts;
};
