const express = require('express');
const routes = require('./routes');
const path = require('path');//para poder acceder a las carpetas
const flash=require('connect-flash');
const session=require('express-session');
const cookieParser=require('cookie-parser');
const passport=require('./config/passport');



//helper con algunas funciones

const helpers = require('./helpers');

//Crear la conexión a la BD
const db = require('./config/db');


//Importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');
require('./models/Horarios');
require('./models/UsuariosProyectos');
require('./models/Comentarios');
require('./models/Notificaciones');

db.sync()
    .then(()=>console.log('conectado al servidor'))
    .catch(error => console.log(error));

//Crear un aplicacion de express

const app = express();

//Donde cargar los archivos estaticos
app.use(express.static('public'));



//Habilitar pug (Sistema de vistas)
app.set('view engine','pug');

app.use(express.json());
//Habilitar bodyParser para leer datos del formulario
app.use(express.urlencoded({extended:true}));


//Añadir la carpeta de las vistas
app.set('views',path.join(__dirname,'./views'));

//agregar flash-messages
app.use(flash());

app.use(cookieParser());

//Sessiones nos permiten navegar entre distintas paginas sin volver a autenticar
app.use(session({
    secret:'supersecreto',
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

//Pasar vardump a la aplicacion
app.use((req,res,next)=>{
    //con locals la variable queda disponible para toda la aplicacion
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes=req.flash();
    res.locals.usuario={...req.user} || null;//donde se guardan los datos del usuario logeado
    //console.log(res.locals.usuario);
    next();
});



app.use('/',routes());


app.listen(7000);

require('./handlers/email');