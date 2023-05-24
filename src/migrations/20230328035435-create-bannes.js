"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("banners", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      title: {
        type: Sequelize.STRING,
      },
      linkurl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      webImageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobileImageUrl : {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isEnabled: {
        type: Sequelize.BOOLEAN,
        default: true,
      },
      startAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      endAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      position: {
        type: Sequelize.STRING,
        allowNull:true
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
    await queryInterface.dropTable("banners");
  },
};
