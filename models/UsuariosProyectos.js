const Sequelize = require('sequelize');
const db = require('../config/db');
const Proyectos=require('./Proyectos');
const Usuarios=require('./Usuarios');

const UsuariosProyectos = db.define('Usuarios_Proyectos',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
      
});

Usuarios.belongsToMany(Proyectos,{through:"Usuarios_Proyectos"});
Proyectos.belongsToMany(Usuarios,{through:"Usuarios_Proyectos"});
Usuarios.hasMany(UsuariosProyectos);
UsuariosProyectos.belongsTo(Usuarios);
Proyectos.hasMany(UsuariosProyectos);
UsuariosProyectos.belongsTo(Proyectos);

module.exports = UsuariosProyectos;