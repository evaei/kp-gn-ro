"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      products.hasMany(models.category_products, {
        foreignKey: "productId",
      });

      products.hasMany(models.product_images, {
        foreignKey: "productId",
      });

      products.hasMany(models.users_wishlists, {
        as: 'wishlist'
      });
    }
  }
  products.init(
    {
      sellerId: DataTypes.STRING,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      price: { type: DataTypes.FLOAT, defaultValue: 0.0 },
      quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
      weight: { type: DataTypes.INTEGER, defaultValue: 0 },
      sku: DataTypes.STRING,
      width: { type: DataTypes.FLOAT, defaultValue: 0.0 },
      height: { type: DataTypes.FLOAT, defaultValue: 0.0 },
      length: { type: DataTypes.FLOAT, defaultValue: 0.0 },
      isPublish: { type: DataTypes.BOOLEAN, defaultValue: false },
      isEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "products",
    }
  );
  return products;
};
