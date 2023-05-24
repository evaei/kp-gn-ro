"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class seller_addresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  seller_addresses.init(
    {
      sellerId: DataTypes.STRING,
      addresses: DataTypes.STRING,
      province: DataTypes.STRING,
      district: DataTypes.STRING,
      subDistrict: DataTypes.STRING,
      zipcode: DataTypes.INTEGER,
      contactNumber: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "seller_addresses",
    }
  );
  return seller_addresses;
};
