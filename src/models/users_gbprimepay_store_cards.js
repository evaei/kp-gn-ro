"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users_gbprimepay_store_cards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users_gbprimepay_store_cards.init(
    {
      userId: DataTypes.STRING,
      creditCardName: DataTypes.STRING,
      creditCardNumber: DataTypes.STRING,
      tokenId: DataTypes.STRING,
      expiryDate: DataTypes.STRING,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "users_gbprimepay_store_cards",
    }
  );
  return users_gbprimepay_store_cards;
};
