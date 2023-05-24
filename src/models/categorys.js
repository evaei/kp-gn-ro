"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class categorys extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      categorys.hasMany(models.category_products, {
        foreignKey: 'categoryId'
      });
    }
  }
  categorys.init(
    {
        categoryCode: DataTypes.STRING,
        name: DataTypes.STRING,
        categoryOrder: {type : DataTypes.STRING,defaultValue:0},
        mobileImage : DataTypes.STRING,
        isDisplay: {type: DataTypes.BOOLEAN, defaultValue: true},
        isEnabled: {type: DataTypes.BOOLEAN, defaultValue: true},
        createByAdminId: DataTypes.STRING,
        serviceFee: {
          type: DataTypes.FLOAT,
          defaultValue: 15.0,
        },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "categorys",
    }
  );
  return categorys;
};
