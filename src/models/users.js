"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      dateOfBirth: DataTypes.DATE,
      groupId: DataTypes.INTEGER,
      passwordHash: DataTypes.STRING,
      jwtToken: DataTypes.STRING,
      resetJwtToken: DataTypes.STRING,
      gender: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      username: DataTypes.STRING,
      userProfile: DataTypes.STRING,
      defaultBilling: DataTypes.INTEGER,
      defaultShipping: DataTypes.INTEGER,
      recentLogin: DataTypes.DATE,
      loginProvider: DataTypes.STRING,
      recentLogout: DataTypes.DATE,
      logoutProvider: DataTypes.STRING,
      isEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "users",
    }
  );
  return users;
};
