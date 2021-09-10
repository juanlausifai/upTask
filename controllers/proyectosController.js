const UsuariosProyectos=require('../models/UsuariosProyectos');
const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');
const Usuarios= require('../models/Usuarios');
const Notificaciones= require('../models/Notificaciones');
const Sequelize= require('sequelize');

exports.proyectosHome = async (req, res)=>{
    const usuarioId=res.locals.usuario.id;
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

    const [proyectos,notificaciones] = await Promise.all([proyectosPromise,notificacionesPromise]);
    
    let cantNotificacion=0;
    if (!notificaciones.length==0) {
        cantNotificacion=notificaciones[0].dataValues.cantNotificaciones;  
    }

    
    res.render('index',{
        nombrePagina:'Proyectos',
        proyectos,
        cantNotificacion,
    });
}

exports.formularioProyecto = async (req, res)=>{
    const usuarioId=res.locals.usuario.id;
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

    const usuariosPromise = Usuarios.findAll();

    const [proyectos,notificaciones,usuarios] = await Promise.all([proyectosPromise,notificacionesPromise,usuariosPromise]);

    let cantNotificacion=0;
    if (!notificaciones.length==0) {
        cantNotificacion=notificaciones[0].dataValues.cantNotificaciones;  
    }
    

    
    const usuariosSeleccionados=[];
    res.render('nuevo-proyecto',{
        nombrePagina:'Nuevo Proyecto',
        proyectos,
        usuarios,
        usuariosSeleccionados,
        cantNotificacion 
    });
}

exports.nuevoProyecto = async (req, res)=>{
    const usuarioId=res.locals.usuario.id;
    const proyectos= await Proyectos.findAll({
        //join
        include:{
            model: UsuariosProyectos,
            where:{
                usuarioId:usuarioId,
            },   
        }
    });
    //Validar que tengamos algo en el nombre
    const { nombre } = req.body;
    const {usuarios}=req.body;

    //console.log(usuarios);

    let errores = [];

    if (!nombre) {
        errores.push({texto:'Agregar un nombre al proyecto'});
    }

    //si hay errores
    if (errores.length > 0) {
        res.render('nuevo-proyecto',{
            nombrePagina:'Nuevo Proyecto',
            errores,
            proyectos
        });
    }else{
        //No hay errores 
        //insertar en la base de datos
        const avance=0;
        const usuarioId=res.locals.usuario.id;
        const proyecto = await Proyectos.create({ nombre,usuarioId,avance });

        for (let i = 0; i < usuarios.length; i++) {
            const usuarioId = usuarios[i];
            const proyectoId = proyecto.id;
            const usuarios_proyectos= await UsuariosProyectos.create({usuarioId,proyectoId}); 
        }
        
        res.redirect('/');
    }
    
}

//Traer solamente un proyecto
exports.proyectoPorUrl = async (req,res)=>{
    
    const usuarioId=res.locals.usuario.id;
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

    const proyectoPromise = Proyectos.findOne({
        where:{
            url:req.params.url,
            /*usuarioId:usuarioId*/
        },
        include:{
            model: UsuariosProyectos,
            where:{
                usuarioId:usuarioId,
            }
        }
    });

    //Cuando hay mas de dos consultas await, lo ponemos de la siguiente manera
    const [proyectos,proyecto] = await Promise.all([proyectosPromise,proyectoPromise]);

    //Consultar tareas del proyecto actual
    const tareasEsperaPromise= Tareas.findAll({
        attributes: [
            'id',
            'tarea',
            'estado',
            'ejecutando',
            'proyectoId',
            'usuarioId',
            [Sequelize.fn('date_format', Sequelize.col('entrega'), '%d-%m-%Y'), 'entrega']
        ],
        where:{
            proyectoId:proyecto.id,
            estado:0
        },
        include:{
            model: Usuarios,
            where:{
                id:Sequelize.col('tareas.usuarioId'),
            }
        }
    });
    
     
    //Consultar tareas del proyecto actual
     const tareasProcesoPromise= Tareas.findAll({
        attributes: [
            'id',
            'tarea',
            'estado',
            'ejecutando',
            'proyectoId',
            'usuarioId',
            [Sequelize.fn('date_format', Sequelize.col('entrega'), '%d-%m-%Y'), 'entrega']
        ],
        where:{
            proyectoId:proyecto.id,
            estado:1
        },
        include:{
            model: Usuarios,
            where:{
                id:Sequelize.col('tareas.usuarioId'),
            }
        }
    });

    const tareasFinalizadasPromise= Tareas.findAll({
        attributes: [
            'id',
            'tarea',
            'estado',
            'ejecutando',
            'proyectoId',
            'usuarioId',
            [Sequelize.fn('date_format', Sequelize.col('entrega'), '%d-%m-%Y'), 'entrega']
        ],
        where:{
            proyectoId:proyecto.id,
            estado:2
        },
        include:{
            model: Usuarios,
            where:{
                id:Sequelize.col('tareas.usuarioId'),
            }
        }
    });

    const usuariosPromise= Usuarios.findAll({
        //join
        include:{
            model: UsuariosProyectos,
            where:{
                proyectoId:proyecto.id,
            },
        }
    });

    const notificacionesPromise= Notificaciones.findAll({
        group: ['usuarioId'],
        attributes: ['usuarioId', [Sequelize.fn('COUNT', 'usuarioId'), 'cantNotificaciones']],
        where:{
            usuarioId:usuarioId,
            estado:0
        },
    });

    const [tareasEspera,tareasProceso,tareasFinalizadas,usuarios,notificaciones] = await Promise.all([tareasEsperaPromise,tareasProcesoPromise,tareasFinalizadasPromise,usuariosPromise,notificacionesPromise]);

    let cantNotificacion=0;
    if (!notificaciones.length==0) {
        cantNotificacion=notificaciones[0].dataValues.cantNotificaciones;  
    }
    

    if(!proyecto) return next();

    res.render('tareas',{
        nombrePagina:"Tareas del proyecto",
        proyectos,
        proyecto,
        tareasEspera,
        tareasFinalizadas,
        tareasProceso,
        usuarios,
        cantNotificacion,
        usuarioId
    })
   
}


exports.formularioEditar = async (req,res)=>{
    const usuarioId=res.locals.usuario.id;
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

    const proyectoPromise = Proyectos.findOne({
        where:{
            id:req.params.id,
            usuarioId:usuarioId
        },
    });

    const usuariosPromise = await Usuarios.findAll();
    const usuariosSeleccionadosPromise= Usuarios.findAll({
        //join
        include:{
            model: UsuariosProyectos,
            where:{
                proyectoId:req.params.id,
            },
        }
    });

    const notificacionesPromise= Notificaciones.findAll({
        group: ['usuarioId'],
        attributes: ['usuarioId', [Sequelize.fn('COUNT', 'usuarioId'), 'cantNotificaciones']],
        where:{
            usuarioId:usuarioId,
            estado:0
        },
    });

    //Cuando hay mas de dos consultas await, lo ponemos de la siguiente manera
    const [proyectos,proyecto,usuarios,usuariosSeleccionados,notificaciones] = await Promise.all([proyectosPromise,proyectoPromise,usuariosPromise,usuariosSeleccionadosPromise,notificacionesPromise]);
    
    let cantNotificacion=0;
    if (!notificaciones.length==0) {
        cantNotificacion=notificaciones[0].dataValues.cantNotificaciones;  
    }
    

    res.render('nuevo-proyecto',{
        nombrePagina:'Editar proyecto',
        proyectos,
        proyecto,
        usuarios,
        usuariosSeleccionados,
        cantNotificacion
    })
}


exports.actualizarProyecto = async (req, res)=>{
    const usuarioId=res.locals.usuario.id;
    const proyectos = Proyectos.findAll({where:{usuarioId:usuarioId}});
    //Validar que tengamos algo en el nombre
    const { nombre,usuarios } = req.body;

    let errores = [];

    if (!nombre) {
        errores.push({texto:'Agregar un nombre al proyecto'});
    }

    //si hay errores
    if (errores.length > 0) {
        res.render('nuevo-proyecto',{
            nombrePagina:'Nuevo Proyecto',
            errores,
            proyectos
        });
    }else{
        //No hay errores 
        //insertar en la base de datos
        const usuarioId=res.locals.usuario.id;

        const proyecto = await Proyectos.update(
            { nombre:nombre,usuarioId:usuarioId},
            {where:{id:req.params.id}}
            );
            
            const idProyecto=req.params.id;

            const resultado=await UsuariosProyectos.destroy({where:{ proyectoId :idProyecto}});
        
        for (let i = 0; i < usuarios.length; i++) {
            const usuarioId = usuarios[i];
            const proyectoId = idProyecto;
            const usuarios_proyectos= await UsuariosProyectos.create({usuarioId,proyectoId}); 
        }

        res.redirect('/');
    }
    
}

exports.eliminarProyecto = async(req,res,next)=>{
    //req, query o params
    //console.log(req.query);

    const {urlProyecto}=req.query;
    
    const resultado=await Proyectos.destroy({where:{ url :urlProyecto}});

    if (!resultado) {
        return next();
    }

    res.status(200).send('Proyecto eliminado correctamente!');
}


exports.cambiarEstadoProyecto=async (req,res)=>{
    //res.send("todo bien...");
    const {id}=req.params;
    const {avance}=req.params;
    const proyecto=await Proyectos.findOne({where:{id: id}});

    //console.log(avance);
    //cambiar el estado
    let avanceReq=avance;
    
    proyecto.avance=avanceReq;
    const resultado = await proyecto.save();

    if (!resultado) {
        return next();
    }

    res.status(200).send('Actualizando');
}


exports.listadoProyectos = async (req, res)=>{
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

    const listadoProyectoPromise= Proyectos.findAndCountAll({
        include:{
            model: UsuariosProyectos,
            where:{
                usuarioId:usuarioId,
            },   
        },
        limit:limit,
        offset:offset,
        order:[['id','DESC']],
    });

    const [proyectos,notificaciones,listadoProyectos] = await Promise.all([proyectosPromise,notificacionesPromise,listadoProyectoPromise]);

    let cantNotificacion=0;
    if (!notificaciones.length==0) {
        cantNotificacion=notificaciones[0].dataValues.cantNotificaciones;  
    }

    const totalPages = Math.ceil(listadoProyectos.count / limit);
    const pageSize=listadoProyectos.rows.length;

    let arrayPaginas=[];

    for (let i = 0; i < totalPages; i++) {
         arrayPaginas[i] =i+1;
    }
    
    res.render('listado-proyectos',{
        nombrePagina:'Proyectos',
        proyectos,
        cantNotificacion,
        listadoProyectos,
        arrayPaginas,
        page
    });
}