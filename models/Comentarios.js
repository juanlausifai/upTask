const Sequelize = require('sequelize');
const db = require('../config/db');
const Tareas=require('./Tareas');
const Usuarios=require('./Usuarios');

const Comentarios=db.define('comentarios',{
    id:{
        type:Sequelize.INTEGER(11),
        primaryKey:true,
        autoIncrement:true
    },
    usuarioId:Sequelize.INTEGER,
    observacion:Sequelize.TEXT,
},{
    timestamps: true
  });
Comentarios.belongsTo(Tareas);
Comentarios.belongsTo(Usuarios);

module.exports=Comentarios;