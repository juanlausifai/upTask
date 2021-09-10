import Swal from "sweetalert2";
import axios from "axios";

 export const actualizarAvance = ()=>{
    //Seleccionar las tareas existentes
    const tareas=document.querySelectorAll('li.tarea');
    
    if (tareas.length) {
        
        //Seleccionar las tareas completadas
        const tareasCompletas = document.querySelectorAll('i.completo');
        
        //Calcular el avance
        const avance = Math.round((tareasCompletas.length /tareas.length) * 100);
        //Mostrar el avance 
        const porcentaje = document.querySelector('#porcentaje');
        porcentaje.style.width = avance+'%';
        
        const idProyecto = document.querySelector('#idProyecto');
        const id = idProyecto.value;

        const url=`${location.origin}/cambiar-estado/${id}/${avance}`;
            
        axios.patch(url,{id},{avance})
        .then(function(respuesta){
            if(respuesta.status===200){
               
            }
        });
        
        if (avance===100) {
           

            Swal.fire(
                'Completaste el proyecto',
                'Felicidades, has terminado tus tareas',
                'success'
            );
        }

    }

   
}

