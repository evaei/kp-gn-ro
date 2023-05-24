"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class category_products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      category_products.belongsTo(models.products, {
        foreignKey: 'productId'
      });

      category_products.belongsTo(models.categorys, {
        foreignKey: 'categoryId'
      });
    }
  }
  category_products.init(
    {
        categoryId: DataTypes.STRING,
        productId: DataTypes.STRING,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "category_products",
    }
  );
  return category_products;
};
