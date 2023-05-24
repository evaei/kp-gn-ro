"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users_addresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users_addresses.init(
    {
      userId: DataTypes.STRING,
      addresses: DataTypes.STRING,
      province: DataTypes.STRING,
      district: DataTypes.STRING,
      subDistrict: DataTypes.STRING,
      zipcode: DataTypes.INTEGER,
      contactNumber: DataTypes.STRING,
      remark: DataTypes.STRING,
      isDefaultBilling: DataTypes.BOOLEAN,
      isDefaultShipping: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "users_addresses",
    }
  );
  return users_addresses;
};
