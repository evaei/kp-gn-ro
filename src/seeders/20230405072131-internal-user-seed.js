"use strict";
const bcrypt = require("bcrypt");
const config = require("../config/appconfig");
const { v4: uuidv4 } = require("uuid");
const passHash = bcrypt.hashSync("123456789", Number(config.auth.saltRounds));
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "internal_users",
      [
        {
          id: uuidv4(),
          adminCode: "SA001",
          firstName: "Super",
          lastName: "Admin",
          email: "super@admin.com",
          passwordHash: passHash,
          role: "admin",
          isEnabled: 1,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("internal_users", null, {});
  },
};
