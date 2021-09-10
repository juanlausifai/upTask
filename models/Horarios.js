const Sequelize = require('sequelize');
const db = require('../config/db');
const Tareas=require('./Tareas');

const Horarios=db.define('horarios',{
    id:{
        type:Sequelize.INTEGER(11),
        primaryKey:true,
        autoIncrement:true
    },
    hora:Sequelize.DATE,
    usuarioId:Sequelize.INTEGER,
    estado:Sequelize.INTEGER,
});
Horarios.belongsTo(Tareas);
module.exports=Horarios;