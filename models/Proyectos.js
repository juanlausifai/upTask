const Sequelize = require('sequelize');
const db = require('../config/db');
const slug = require('slug');
const shortId = require('shortid');



const Proyectos = db.define('proyectos',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    nombre:Sequelize.STRING,
    url:Sequelize.STRING,
    avance:Sequelize.INTEGER,  
},{
    hooks: {//Antes que se insertado en la base de datos
        beforeCreate(proyecto){
            const url = slug(proyecto.nombre).toLowerCase();

            proyecto.url = `${url}-${shortId.generate()}`;
        }
    }
});



module.exports = Proyectos;