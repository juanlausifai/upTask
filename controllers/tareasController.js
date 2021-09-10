const Proyectos =require('../models/Proyectos');
const Tareas =require('../models/Tareas');
const Horarios = require('../models/Horarios');
const Comentarios = require('../models/Comentarios');
const Usuarios = require('../models/Usuarios');
const UsuariosProyectos = require('../models/UsuariosProyectos');
const Sequelize = require('sequelize');
const Notificaciones = require('../models/Notificaciones');

exports.agregarTarea= async (req,res,next)=>{
    //resp.send('enviado');
    //Obtenemos el proyecto actual (con la url)
    const proyecto = await Proyectos.findOne({where: {url:req.params.url}});

    //leer el valor
    const {tarea,usuario,entrega}=req.body;
    const estado= 0;
    const ejecutando= 0;
    //proyectoId(tiene que tener el mismo nombre que en la tabla)
    const proyectoId=proyecto.id;
    const usuarioId=usuario;
    //Insertar en la base de datos

    const resultado= await Tareas.create({tarea,estado,ejecutando,proyectoId,entrega,usuarioId});

    if(!resultado){
        return next();
    }

    //Redireccionar
    res.redirect(`/proyectos/${req.params.url}`);
}

exports.actualizarTarea= async (req,res,next)=>{

    //leer el valor
    const {tarea,usuario,entrega,id}=req.body;
    const usuarioId=usuario;
    
    //Insertar en la base de datos
    const resultado= await Tareas.update({tarea,entrega,usuarioId},{where:{id:id}});

    if(!resultado){
        return next();
    }

    //Redireccionar
    res.redirect(`/proyectos/${req.params.url}`);
}


exports.cambiarEstadoTarea=async (req,res)=>{
    //res.send("todo bien...");
    const {id}=req.params;
    const tarea=await Tareas.findOne({where:{id: id}});

    //si hay errores
    if (tarea.ejecutando==1) {
        res.status(405).send('Se encuentra en ejecución la tarea');
        //return next();
    }else{

        //cambiar el estado
        let estado=0;

        if(tarea.estado==0){
            estado=1; 
        }

        if(tarea.estado==1){
            estado=2; 
        }
        
        tarea.estado=estado;
        const resultado = await tarea.save();

        if (!resultado) {
            return next();
        }

        res.status(200).send('Actualizando');

    } 
}


exports.retrocederEstadoTarea=async (req,res)=>{
    //res.send("todo bien...");
    const {id}=req.params;
    const tarea=await Tareas.findOne({where:{id: id}});

    //si hay errores
    if (tarea.ejecutando==1) {
        res.status(405).send('Se encuentra en ejecución la tarea');
        //return next();
    }else{
        //cambiar el estado
        let estado=0;

        if(tarea.estado==2){
            estado=1; 
        }

        if(tarea.estado==1){
            estado=0; 
        }
        
        tarea.estado=estado;
        const resultado = await tarea.save();

        if (!resultado) {
            return next();
        }

        res.status(200).send('Actualizando');
    }
}

exports.eliminarTarea=async (req,res)=>{
    const {id}=req.params;

    //Eliminar la tarea
    const eliminarComentariosPromise= Comentarios.destroy({where:{tareaId: id}});
    const eliminarHorariosPromise= Horarios.destroy({where:{tareaId: id}});
    const eliminarTareaPromise= Tareas.destroy({where:{id: id}});

    const [eliminarComentario,eliminarHorarios,eliminarTarea] = await Promise.all([eliminarComentariosPromise,eliminarHorariosPromise,eliminarTareaPromise]);


    if (!eliminarTarea && eliminarComentario && eliminarHorarios) {
        return next();
    }

    res.status(200).send('Tarea eliminada correctamente');
}


exports.ejecutandoTarea=async (req,res)=>{
    //res.send("todo bien...");
    const {id}=req.params;
    const tarea=await Tareas.findOne({where:{id: id}});

    //cambiar el campo ejecutando
    let ejecutando=0;
    let estado=0;//inicia

    if(tarea.ejecutando==0){
        ejecutando=1;
        estado=1;//finaliza 
    }
    
    tarea.ejecutando=ejecutando;
    const promiseResultado = tarea.save();

    let hoy=new Date();
    let fecha = hoy.getFullYear() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getDate();
    let horario = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    let hora = fecha + ' ' + horario;

    const usuarioId=res.locals.usuario.id;
    const tareaId=id;
    const promiseHorarios = Horarios.create({ hora,usuarioId,estado,tareaId });

    const [resultado,horarios] = await Promise.all([promiseResultado,promiseHorarios]);

    if (!resultado && !horarios) {
        return next();
    }

    res.status(200).send('Actualizando');
}


exports.listadoComentarios=async (req,res)=>{
    const {tareaId}=req.params;
    
    const comentarios= await Comentarios.findAll({
        where:{tareaId: tareaId},
        include:{
            model: Usuarios,
            where:{
                id:Sequelize.col('comentarios.usuarioId'),
            }
        }
    
    });

    if (!comentarios) {
        return next();
    }
    
    res.status(200).send(comentarios);
}



exports.agregarComentario= async (req,res,next)=>{
    
    let {observacion,tareaId}=req.body;
    const usuarioId=res.locals.usuario.id;

    const comentario= await Comentarios.create({usuarioId,observacion,tareaId});

    //Carga de notificaciones
    const proyecto= await Tareas.findAll({
        where:{id: tareaId},
        include:{
            model: Proyectos,
            where:{
                id:Sequelize.col('tareas.proyectoId'),
            },
            include:{
                model: UsuariosProyectos,
            }
        }
    });
    
    let arregloUsuariosDelProyecto=proyecto[0].proyecto.Usuarios_Proyectos;
    const estado=0;
    
    observacion=`Se agregó comentario: ${observacion}, en la tarea: ${proyecto[0].tarea}, del proyecto: ${proyecto[0].proyecto.nombre}`;
    const enlace=proyecto[0].proyecto.url;

    for (let i = 0; i < arregloUsuariosDelProyecto.length; i++) {
        const element = arregloUsuariosDelProyecto[i];
        let usuarioId=element.usuarioId;
        const Notificacion= await Notificaciones.create({observacion,tareaId,usuarioId,estado,enlace});
    }

    if(!comentario){
        return next();
    }

    res.status(200).send("Se ingreso con exito el comentario");
}


exports.listadoTareasSinFinalizar = async (req, res)=>{
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

    const listadoTareasSinFinalizarPromise= Tareas.findAndCountAll({
        attributes: [
            'id',
            'tarea',
            'estado',
            'ejecutando',
            'proyectoId',
            'usuarioId',
            [Sequelize.fn('date_format', Sequelize.col('entrega'), '%Y-%m-%d'), 'entrega']
        ],
        where:{
            usuarioId:usuarioId,
            estado: {
                [Sequelize.Op.not]: 2
              },
        },
        include:{
            model: Proyectos,
            where:{
                id:Sequelize.col('tareas.proyectoId'),
            }
        },
        limit:limit,
        offset:offset,
        order:[['entrega','ASC']],
    });

    const [proyectos,notificaciones,listadoTareasSinFinalizar] = await Promise.all([proyectosPromise,notificacionesPromise,listadoTareasSinFinalizarPromise]);

    let cantNotificacion=0;
    if (!notificaciones.length==0) {
        cantNotificacion=notificaciones[0].dataValues.cantNotificaciones;  
    }

    const totalPages = Math.ceil(listadoTareasSinFinalizar.count / limit);
    const pageSize=listadoTareasSinFinalizar.rows.length;

    let arrayPaginas=[];

    for (let i = 0; i < totalPages; i++) {
         arrayPaginas[i] =i+1;
    }
    
    res.render('listado-tareas-sin-finalizar',{
        nombrePagina:'Tareas sin finalizar',
        proyectos,
        cantNotificacion,
        listadoTareasSinFinalizar,
        arrayPaginas,
        page
    });
}


exports.esResponsableDelProyecto=async (req,res)=>{
    const {tareaId}=req.params;
    const usuarioId=res.locals.usuario.id;
    
    const proyectos= await Tareas.findAll({
        where:{id: tareaId},
        include:{
            model: Proyectos,
            where:{
                id:Sequelize.col('tareas.proyectoId'),
                usuarioId:usuarioId
            }
        },
        limit:1
    });

    if (!proyectos) {
        return next();
    }
    
    res.status(200).send(proyectos);
}