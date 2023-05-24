'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('categorys',
      'serviceFee', // new field name
     {
       type: Sequelize.FLOAT,
       defaultValue: 15.0
     },);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.removeColumn('categorys', 'serviceFee'),
    ]);
  }
};