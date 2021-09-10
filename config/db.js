const { Sequelize } = require('sequelize');

const db = new Sequelize('uptasknode', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
    port:'3306',
    //operatorsAliases:false,
    define:{
        timestamps:false
    },
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    }
  });

  module.exports = db;