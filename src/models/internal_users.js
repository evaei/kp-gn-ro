"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class internal_users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  internal_users.init(
    {
      adminCode: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      role: DataTypes.STRING,
      passwordHash: DataTypes.STRING,
      jwtToken: DataTypes.STRING,
      resetJwtToken: DataTypes.STRING,
      gender: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      recentLogin: DataTypes.DATE,
      isEnabled: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "internal_users",
    }
  );
  return internal_users;
};
