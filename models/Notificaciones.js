const Sequelize = require('sequelize');
const db = require('../config/db');
const Tareas=require('./Tareas');
const Usuarios=require('./Usuarios');

const Notificaciones=db.define('notificaciones',{
    id:{
        type:Sequelize.INTEGER(11),
        primaryKey:true,
        autoIncrement:true
    },
    observacion:Sequelize.TEXT,
    estado:Sequelize.INTEGER(1),
    enlace:Sequelize.STRING
},{
    timestamps: true
  });
  
Notificaciones.belongsTo(Tareas);
Notificaciones.belongsTo(Usuarios);

module.exports=Notificaciones;