"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("review_products", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userId: {
        type: Sequelize.STRING,
      },
      orderId: {
        type: Sequelize.STRING,
      },
      sellerId: {
        type: Sequelize.STRING,
      },
      productId: {
        type: Sequelize.STRING,
      },
      comment: {
        type: Sequelize.STRING,
      },
      rate: {
        type: Sequelize.FLOAT,
      },
      productName: {
        type: Sequelize.STRING,
      },
      productImgUrl: {
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
    await queryInterface.dropTable("review_products");
  },
};
