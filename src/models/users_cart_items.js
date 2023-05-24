"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users_cart_items extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users_cart_items.belongsTo(models.users_carts, {
        foreignKey: "cartId",
        as: "cartItems",
      });

      users_cart_items.belongsTo(models.sellers, {
        foreignKey: "sellerId",
      });
    }
  }
  users_cart_items.init(
    {
      cartId: DataTypes.STRING,
      userId: DataTypes.STRING,
      sellerId: DataTypes.STRING,
      productId: DataTypes.STRING,
      productName: DataTypes.STRING,
      productWeight: DataTypes.INTEGER,
      productImage: DataTypes.STRING,
      productPrice: DataTypes.FLOAT,
      quantity: DataTypes.INTEGER,
      totalPrice: DataTypes.FLOAT,
      isCheckedOut: DataTypes.BOOLEAN,
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "users_cart_items",
    }
  );
  return users_cart_items;
};
