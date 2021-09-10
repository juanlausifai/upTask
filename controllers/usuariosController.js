const Usuarios=require('../models/Usuarios');
const enviarEmail=require('../handlers/email');

exports.formCrearCuenta = (req,res)=>{
    res.render('crearCuenta',{
        nombrePagina:'Crear cuenta en UpTask'
    })
}

exports.formIniciarSesion = (req,res)=>{
    const {error}=res.locals.mensajes;
    res.render('iniciarSesion',{
        nombrePagina:'Iniciar Sesión en UpTask',
        error:error,
    })
}

exports.crearCuenta = async (req,res)=>{
   //Leer los datos
    const {email,nombre,password}=req.body;

    try {
        //crear el usuario
        await Usuarios.create({
            email,
            nombre,
            password
        }); 

        //Crear una URL para confirmar
        const confirmarUrl=`http://${req.headers.host}/confirmar/${email}`;

        //Crear objeto de usuario
            const usuario={
                email
            }

        //Enviar email
        await enviarEmail.enviar({
            usuario:usuario,
            subject:'Confirma tu cuenta en UpTask',
            confirmarUrl:confirmarUrl,
            archivo:'confirmar-cuenta'
        });
        
        //Redirigir al usuario
        req.flash('correcto','Enviamos un correo, confirma tu cuenta');

        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error',error.errors.map(error=>error.message));
        res.render('crearCuenta',{
            mensajes:req.flash(),//me retorna sequelize como error
            nombrePagina:'Crear cuenta en UpTask',
            email:email,
            password:password,
        })
    }
   
}

exports.formRestablecerPassword=(req,res)=>{
    res.render('restablecer',{
        nombrePagina:'Restablecer tu contraseña'
    });
}