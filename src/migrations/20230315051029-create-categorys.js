"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("categorys", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      categoryCode: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categoryOrder: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobileImage : {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isDisplay: {
        type: Sequelize.BOOLEAN,
        default: true,
      },
      isEnabled: {
        type: Sequelize.BOOLEAN,
        default: true,
      },
      createByAdminId: {
        type: Sequelize.STRING,
        allowNull:true
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
    await queryInterface.dropTable("categorys");
  },
};
