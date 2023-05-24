"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("seller_addresses", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      sellerId: {
        type: Sequelize.STRING,
      },
      addresses: {
        type: Sequelize.STRING,
      },
      province: {
        type: Sequelize.STRING,
      },
      district: {
        type: Sequelize.STRING,
      },
      subDistrict: {
        type: Sequelize.STRING,
      },
      zipcode: {
        type: Sequelize.INTEGER,
      },
      contactNumber: {
        type: Sequelize.STRING,
      },
      remark: {
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
    await queryInterface.dropTable("seller_addresses");
  },
};
