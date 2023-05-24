"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class seller_groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  seller_groups.init(
    {
      name: DataTypes.STRING,
      isDisplay: {type: DataTypes.BOOLEAN, defaultValue: true},
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "seller_groups",
    }
  );
  return seller_groups;
};
