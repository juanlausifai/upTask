import axios from "axios";
import Swal from "sweetalert2";

const notificaciones=document.querySelector('.listado-notificaciones');
const spanNotificaciones=document.querySelector('#spanNotificaciones');
if (notificaciones) {
    notificaciones.addEventListener('click',(e)=>{
        
        if (e.target.classList.contains('fa-check') && !e.target.classList.contains('letra-verde')) {
            const icono=e.target;
            const idNotificaciones=icono.parentElement.parentElement.dataset.notificacion;
            const li=icono.parentElement.parentElement;
            
            //request hacia /tareas/:id
            const url=`${location.origin}/notificaciones/${idNotificaciones}`;
                
            let spanNotificacionesValor="";
            axios.patch(url,{idNotificaciones})
            .then(function(respuesta){
                if(respuesta.status===200){
                    icono.classList.toggle('letra-verde');
                    spanNotificacionesValor=parseInt(spanNotificaciones.innerHTML)-1;
                    spanNotificaciones.innerHTML=spanNotificacionesValor;
                }
            });
        }

    });

}