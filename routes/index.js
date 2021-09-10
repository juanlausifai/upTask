const express = require('express');
const router = express.Router();

//Importar express validator

const { body } = require('express-validator/check');

//Importar el controlador
const proyectosController = require('../controllers/proyectosController');
const tareasController = require('../controllers/tareasController.js');
const usuariosController = require('../controllers/usuariosController.js');
const notificacionesController = require('../controllers/notificacionesController');
const authController = require('../controllers/authController');

module.exports = function(){
    //Ruta para el home
    router.get('/', 
        authController.usuarioAutenticado,
        proyectosController.proyectosHome
    );
    
    //Ruta para nosotros
    router.get('/nuevo-proyecto',
    authController.usuarioAutenticado,
    proyectosController.formularioProyecto);
   
    //Ruta para enviar el formulario
    router.post('/nuevo-proyecto',
    authController.usuarioAutenticado,
    body('nombre').not().isEmpty().trim().escape(),
    proyectosController.nuevoProyecto);
   
    //Listar proyecto
    router.get('/proyectos/:url',
    authController.usuarioAutenticado,
    proyectosController.proyectoPorUrl);

    //Vista de listado de proyectos
    router.get('/listado-proyectos/:page',
    authController.usuarioAutenticado,
    proyectosController.listadoProyectos);

    //Actualizar el proyecto
    router.get('/proyecto/editar/:id',
    authController.usuarioAutenticado,
    proyectosController.formularioEditar);
    
    router.post('/nuevo-proyecto/:id',
    authController.usuarioAutenticado,
    body('nombre').not().isEmpty().trim().escape(),
    proyectosController.actualizarProyecto);

    //Eliminar proyecto
    router.delete('/proyectos/:url',proyectosController.eliminarProyecto);

    //Editar estado del proyecto
    router.patch('/cambiar-estado/:id/:avance',
    authController.usuarioAutenticado,
    proyectosController.cambiarEstadoProyecto);

    //Agregar Tarea
    router.post('/proyectos/:url',
    authController.usuarioAutenticado,
    tareasController.agregarTarea);

    //Editar Tarea
    router.post('/tareas-editar/:url',
    authController.usuarioAutenticado,
    body('tarea').not().isEmpty().trim().escape(),
    tareasController.actualizarTarea);
    
    //Actualizar tarea(path actualiza solo un dato de la tabla) 
    router.patch('/tareas/:id',
    authController.usuarioAutenticado,
    tareasController.cambiarEstadoTarea);
    //Retroceder el estado de la tarea
    router.patch('/tareasretroceder/:id',
    authController.usuarioAutenticado,
    tareasController.retrocederEstadoTarea);
    //Tarea ejecutando
    router.patch('/tareasejecutando/:id',
    authController.usuarioAutenticado,
    tareasController.ejecutandoTarea);
   
    //Eliminar tarea
    router.delete('/tareas/:id',
    authController.usuarioAutenticado,
    tareasController.eliminarTarea);

    //Vista de listado de tareas sin finalizar
    router.get('/listado-tareas-sin-finalizar/:page',
    authController.usuarioAutenticado,
    tareasController.listadoTareasSinFinalizar);

    //Listar comentarios por tarea
    router.get('/comentarios/:tareaId',
    authController.usuarioAutenticado,
    tareasController.listadoComentarios);

    //Agregar comentario
    router.post('/comentarios/:tareaId',
    authController.usuarioAutenticado,
    tareasController.agregarComentario);

    //Listar notificaciones
    router.get('/notificaciones/:page',
    authController.usuarioAutenticado,
    notificacionesController.notificacionesHome);

    //Cambiar estado de notificacion
    router.patch('/notificaciones/:id',
    authController.usuarioAutenticado,
    notificacionesController.cambiarEstadoNotificacion);

    //Crear nueva Cuenta
    router.get('/crear-cuenta',usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',usuariosController.crearCuenta);

    //Iniciar sesión
    router.get('/iniciar-sesion',usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion',authController.autenticarUsuario);

    //Cerrar session
    router.get('/cerrar-sesion',authController.cerrarSesion);

    //Restablecer contraseña
    router.get('/reestablecer',usuariosController.formRestablecerPassword);
    router.post('/reestablecer',authController.enviarToken);
    router.get('/reestablecer/:token',authController.validarToken);
    router.post('/reestablecer/:token',authController.actualizarPassword);

    //Consulta si es responsable del proyecto
    router.get('/es-responsable-proyecto/:tareaId',
    authController.usuarioAutenticado,
    tareasController.esResponsableDelProyecto);

    
    return router;
}