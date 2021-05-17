const express = require('express');
const router = express.Router();

//Importar el controlador

const proyectosController = require('../controllers/proyectosController');

module.exports = function(){
    //Ruta para el home
    router.get('/', proyectosController.proyectosHome);
    //Ruta para nosotros
    router.get('/nosotros',proyectosController.nosotros);

    return router;
}