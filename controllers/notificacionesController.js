const UsuariosProyectos=require('../models/UsuariosProyectos');
const Proyectos = require('../models/Proyectos');
const Notificaciones= require('../models/Notificaciones');
const Sequelize= require('sequelize');

exports.notificacionesHome = async (req, res)=>{
    const usuarioId=res.locals.usuario.id;
    
    let page = parseInt(req.params.page);
    const limit=5;
    const offset = page ? page * limit : 0;

    const proyectosPromise= Proyectos.findAll({
        //join
        include:{
            model: UsuariosProyectos,
            where:{
                usuarioId:usuarioId,
            },
               
        },
        limit: 10,
        order:[['id','DESC']],
    });

    const notificacionesPromise= Notificaciones.findAll({
        group: ['usuarioId'],
        attributes: ['usuarioId', [Sequelize.fn('COUNT', 'usuarioId'), 'cantNotificaciones']],
        where:{
            usuarioId:usuarioId,
            estado:0
        },
    });

    const listadoNotificacionesPromise= Notificaciones.findAndCountAll({
        where:{
            usuarioId:usuarioId,
        },
        limit:limit,
        offset:offset,
        order:[['id','DESC']],
    });

    const [proyectos,notificaciones,listadoNotificaciones] = await Promise.all([proyectosPromise,notificacionesPromise,listadoNotificacionesPromise]);

    let cantNotificacion=0;
    if (!notificaciones.length==0) {
        cantNotificacion=notificaciones[0].dataValues.cantNotificaciones;  
    }

    const totalPages = Math.ceil(listadoNotificaciones.count / limit);
    const pageSize=listadoNotificaciones.rows.length;

    let arrayPaginas=[];

    for (let i = 0; i < totalPages; i++) {
         arrayPaginas[i] =i+1;
    }
    
    res.render('notificaciones',{
        nombrePagina:'Proyectos',
        proyectos,
        cantNotificacion,
        listadoNotificaciones,
        arrayPaginas,
        page
    });
}


exports.cambiarEstadoNotificacion=async (req,res)=>{
    //res.send("todo bien...");
    const {id}=req.params;
    const notificacion=await Notificaciones.findOne({where:{id: id}});
        
        //cambiar el estado
        let estado=1;

        /*if(notificacion.estado==0){
            estado=1; 
        }*/
        
        notificacion.estado=estado;
        const resultado = await notificacion.save();

        if (!resultado) {
            return next();
        }

        res.status(200).send('Actualizando');
}