"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sellers", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userId: {
        type: Sequelize.STRING,
      },
      storeName: {
        type: Sequelize.STRING,
      },
      storeDescription: {
        type: Sequelize.STRING,
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
      phoneNumber: {
        type: Sequelize.STRING,
      },
      groupId: {
        type: Sequelize.INTEGER,
      },
      urlPath: {
        type: Sequelize.STRING,
      },
      taxId: {
        type: Sequelize.STRING,
      },
      isVacation: {
        type: Sequelize.BOOLEAN,
      },
      isBanned: {
        type: Sequelize.BOOLEAN,
      },
      isApprove: {
        type: Sequelize.BOOLEAN,
      },
      approveBy: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("sellers");
  },
};
