"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sellers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      sellers.hasMany(models.users_cart_items, {
        foreignKey: "sellerId",
      });
    }
  }
  sellers.init(
    {
      userId: DataTypes.STRING,
      storeName: DataTypes.STRING,
      storeDescription: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      groupId: DataTypes.INTEGER,
      urlPath: DataTypes.STRING,
      taxId: DataTypes.STRING,
      isVacation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isApprove: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      approveBy: DataTypes.STRING,
      serviceFee: {
        type: DataTypes.FLOAT,
        defaultValue: 15.0,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "sellers",
    }
  );
  return sellers;
};
