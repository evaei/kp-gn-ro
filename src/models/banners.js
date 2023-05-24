"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class banners extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  banners.init(
    {
        title: DataTypes.STRING,
        linkurl: DataTypes.STRING,
        webImageUrl: DataTypes.STRING,
        mobileImageUrl: DataTypes.STRING,
        isEnabled: {type: DataTypes.BOOLEAN, defaultValue: true},
        startAt: DataTypes.STRING,
        endAt: DataTypes.STRING,
        position: DataTypes.STRING,
        createByAdminId: DataTypes.STRING,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "banners",
    }
  );
  return banners;
};
