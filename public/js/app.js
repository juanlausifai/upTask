import proyectos from './modulos/proyectos';
import tareasEspera from './modulos/tareasEspera';
import tareasProceso from './modulos/tareasProceso';
import tareasFinalizada from './modulos/tareasFinalizada';
import {actualizarAvance} from './funciones/avance';
import notificaciones from './modulos/notificaciones';

document.addEventListener('DOMContentLoaded',()=>{
    actualizarAvance();
    
});

