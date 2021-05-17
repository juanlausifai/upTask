const express = require('express');
const routes = require('./routes');
const path = require('path');//para poder acceder a las carpetas

//Crear un aplicacion de express

const app = express();

//Donde cargar los archivos estaticos
app.use(express.static('public'));

//Habilitar pug (Sistema de vistas)
app.set('view engine','pug');

//Añadir la carpeta de las vistas
app.set('views',path.join(__dirname,'./views'));

app.use('/',routes());


app.listen(7000);