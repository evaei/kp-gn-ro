"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class internal_roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  internal_roles.init(
    {
      roleName: DataTypes.STRING,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "internal_roles",
    }
  );
  return internal_roles;
};
