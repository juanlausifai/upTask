const Sequelize = require('sequelize');
const db = require('../config/db');
const Proyectos=require('./Proyectos');
const bcrypt=require('bcrypt-nodejs');

const Usuarios=db.define('usuarios',{
    id:{
        type:Sequelize.INTEGER(11),
        primaryKey:true,
        autoIncrement:true
    },
    email:{
        type:Sequelize.STRING(60),
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'El email no puede estar vacio'
            },
            isEmail:{
                msg: 'Agrega un correo válido'
            },
        },
        unique:{
            args:true,
            msg:'Usuario ya registrado'
        }
    },
    nombre:{
        type:Sequelize.STRING(100),
        validate:{
            notEmpty:{
                msg:'El nombre no puede estar vacio'
            },
        },
    },
    password:{
        type:Sequelize.STRING(60),
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'La contraseña no puede ir vacia'
            }
        },
    },
    activo:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    token:Sequelize.STRING,
    expiracion:Sequelize.DATE
},{
    hooks:{
        beforeCreate(usuario){
            usuario.password=bcrypt.hashSync(usuario.password,bcrypt.genSaltSync(10));
        }
    }
});

//Metodos personalizados
Usuarios.prototype.verificarPassword=function(password){
    return bcrypt.compareSync(password,this.password);
}

Usuarios.hasMany(Proyectos);



module.exports=Usuarios;