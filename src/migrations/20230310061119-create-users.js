"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      dateOfBirth: {
        type: Sequelize.DATE,
      },
      groupId: {
        type: Sequelize.INTEGER,
      },
      passwordHash: {
        type: Sequelize.STRING,
      },
      jwtToken: {
        type: Sequelize.STRING(555),
      },
      resetJwtToken: {
        type: Sequelize.STRING(555),
      },
      gender: {
        type: Sequelize.STRING,
      },
      phoneNumber: {
        type: Sequelize.STRING,
      },
      username: {
        type: Sequelize.STRING,
      },
      userProfile: {
        type: Sequelize.STRING,
      },
      defaultBilling: {
        type: Sequelize.STRING,
      },
      defaultShipping: {
        type: Sequelize.STRING,
      },
      recentLogin: {
        type: Sequelize.DATE,
      },
      loginProvider: {
        type: Sequelize.STRING,
      },
      recentLogout: {
        type: Sequelize.DATE,
      },
      logoutProvider: {
        type: Sequelize.STRING,
      },
      isEnabled: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
