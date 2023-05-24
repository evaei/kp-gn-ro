"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class review_products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  review_products.init(
    {
      userId: DataTypes.STRING,
      orderId: DataTypes.STRING,
      sellerId: DataTypes.STRING,
      productId: DataTypes.STRING,
      comment: DataTypes.STRING,
      rate: DataTypes.FLOAT,
      productName: DataTypes.STRING,
      productImgUrl: DataTypes.STRING,
      isEnabled: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "review_products",
    }
  );
  return review_products;
};
