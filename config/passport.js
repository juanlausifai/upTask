const passport= require('passport');
const localStrategy= require('passport-local').Strategy;


//Referencia la modelo que vamos autenticar
const Usuarios=require('../models/Usuarios');

//local strategy - Login con credenciales propias (usuarios y password)

passport.use(
    new localStrategy(
        //por default passport espera un usuario y password
        {
            usernameField:'email',
            passwordField:'password'
        },
        async(email,password,done)=>{
            try {
                const usuario= await Usuarios.findOne({
                    where:{email:email}
                });
                //El usuario existe, pero el password es incorrecto
                if (!usuario.verificarPassword(password)) {
                    return done(null,false,{
                        message:'Contraseña incorrecta'
                    }) 
                }
                //El email existe y el password es correcto, retorno el usuario
                return done(null,usuario);
            } catch (error) {
                //Ese usuario no existe
                return done(null,false,{
                    message:'Esa cuenta no existe'
                })
            }
        }
    )
);

//Serializar el usuario
passport.serializeUser((usuario,callback)=>{
    callback(null,usuario);
});

//Deserializar el usuario
passport.deserializeUser((usuario,callback)=>{
    callback(null,usuario);
});

//exportar
module.exports= passport;

