const passport = require('passport');
const Usuarios=require("../models/Usuarios");
const Sequelize=require('sequelize')
const Op=Sequelize.Op;
const crypto=require('crypto');
const bcrypt=require('bcrypt-nodejs');
const enviarEmail=require('../handlers/email');

//autenticar al usuario
exports.autenticarUsuario=passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/iniciar-sesion',
    failureFlash:true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//Funcion para revisar si el usuario esta logueado o no

exports.usuarioAutenticado=(req,res,next)=>{
    //si el usuario esta autenticado adelante

    if (req.isAuthenticated()) {
        return next();
    }

    //sino esta autenticado, redirigir la formulario de login
    return res.redirect('/iniciar-sesion');
}

//Funcion para cerrar sesion
exports.cerrarSesion=(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/iniciar-sesion');

    })
}

//Genera un token si el usuario es valido
exports.enviarToken =async(req,res)=>{
    //Verificar que el usuario exista
    const {email}=req.body;
    const usuario = await Usuarios.findOne({where:{email:email}});

    if (!usuario) {
        req.flash('error','No existe esa cuenta');
        res.redirect('reestablecer');
        
    }

    //usuario existe
    usuario.token=crypto.randomBytes(20).toString('hex');
    //expiracion
    usuario.expiracion=Date.now()+3600000;

    //guardar los datos en la base
    await usuario.save();

    //url reset 
    const resetUrl=`http://${req.headers.host}/reestablecer/${usuario.token}`;

    //Enviar el correo con el token
    await enviarEmail.enviar({
        usuario:usuario,
        subject:'Password Reset',
        resetUrl:resetUrl,
        archivo:'reestablecer-password'
    });

    //terminar 
    req.flash('correcto','Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');

    //console.log(resetUrl);
}

exports.validarToken=async(req,res)=>{
    
    const usuario=await Usuarios.findOne({
        where:{
            token:req.params.token
        }
    });

    //Sino encuentra el usuario
    if (!usuario) {
        req.flash('error','No válido');
        res.redirect('/reestablecer');
    }

    //Formulario para generar el password
    res.render('resetPassword',{
        nombrePagina:'Reestablecer Contraseña'
    })

}

//Cambiar el password por uno nuevo
exports.actualizarPassword= async (req,res)=>{
   
    //verificar el token valido pero tambien la fecha de expiracion
    const usuario=await Usuarios.findOne({
        where:{
            token:req.params.token,
            expiracion:{
                [Op.gte]:Date.now()
            }
        }
    });

    //Verificamos si el usuario existe
    if (!usuario) {
        req.flash('error','No válido');
        res.redirect('/reestablecer');
    }

    //hashear el password
    usuario.password=bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
    usuario.token=null;
    usuario.expiracion=null;
    
    //guardamos el nuevo password
    await usuario.save();
    
    req.flash('correcto','Tu password se ha modificado correctamente');
    res.redirect('/iniciar-sesion');

}