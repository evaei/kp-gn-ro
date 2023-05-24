"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class seller_images extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      seller_images.belongsTo(models.sellers, {
        foreignKey: "sellerId",
      });
    }
  }
  seller_images.init(
    {
      sellerId: DataTypes.STRING,
      url: DataTypes.STRING,
      imageType: DataTypes.STRING,
      coverImagesOrder: {type : DataTypes.STRING,defaultValue:null},
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "seller_images",
    }
  );
  return seller_images;
};
