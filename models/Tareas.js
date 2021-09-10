const Sequelize = require('sequelize');
const db = require('../config/db');
const Proyectos=require('./Proyectos');
const Usuarios=require('./Usuarios');

const Tareas=db.define('tareas',{
    id:{
        type:Sequelize.INTEGER(11),
        primaryKey:true,
        autoIncrement:true
    },
    tarea:Sequelize.STRING(100),
    estado:Sequelize.INTEGER,
    ejecutando:Sequelize.INTEGER,
    entrega:Sequelize.DATE,
});

Tareas.belongsTo(Proyectos);
Tareas.belongsTo(Usuarios);

module.exports=Tareas;