"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class product_images extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      product_images.belongsTo(models.products, {
        foreignKey: "productId",
      });
    }
  }
  product_images.init(
    {
      productId: DataTypes.STRING,
      url: DataTypes.STRING,
      isThumbnail: DataTypes.BOOLEAN,
      imagesOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "product_images",
    }
  );
  return product_images;
};
