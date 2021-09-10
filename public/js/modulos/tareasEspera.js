import axios from "axios";
import Swal from "sweetalert2";
import {actualizarAvance} from '../funciones/avance';

const tareasEspera=document.querySelector('.listado-pendientes');

if (tareasEspera) {
    tareasEspera.addEventListener('click',(e)=>{
        
        if (e.target.classList.contains('fa-edit')) {
            const icono=e.target;
            const idTarea=icono.parentElement.parentElement.dataset.tarea;
            const li=icono.parentElement.parentElement;
            const parrafoText=icono.parentElement.parentElement.children[0].innerHTML;
            const nombreEncargado=icono.parentElement.parentElement.children[1].innerHTML;
            const fechaVencimiento=icono.parentElement.parentElement.children[2].innerHTML;
            esResponsableDeProyectoEdit(idTarea,parrafoText);
            
        }
        if (e.target.classList.contains('fa-arrow-right')) {
            const icono=e.target;
            const idTarea=icono.parentElement.parentElement.dataset.tarea;
            const li=icono.parentElement.parentElement;
            const parrafoText=icono.parentElement.parentElement.children[0].innerHTML;
            const nombreEncargado=icono.parentElement.parentElement.children[1].innerHTML;
            const fechaVencimiento=icono.parentElement.parentElement.children[2].innerHTML;

            const idUsuarioLi=icono.parentElement.parentElement.dataset.usuario;
            const inputIdUsuario=document.querySelector("#identificadorUsuario").value;

            if (idUsuarioLi!==inputIdUsuario) {
              Swal.fire({
                icon: 'error',
                title: 'Lo siento',
                text: 'Esta tarea no esta asignada a usted!',
              })
            }else{
               //request hacia /tareas/:id
              const url=`${location.origin}/tareas/${idTarea}`;
              
              axios.patch(url,{idTarea})
              .then(function(respuesta){
                  if(respuesta.status===200){
                      functionPasarTareaProceso(parrafoText,idTarea,nombreEncargado,fechaVencimiento,idUsuarioLi);
                      li.remove();
                      //icono.classList.toggle('completo');
                      //actualizarAvance();
                  }
              });
            }


           
        }
        if (e.target.classList.contains('fa-comment')) {
            const icono=e.target;
            const tareaId=icono.parentElement.parentElement.dataset.tarea;
            const url=`${location.origin}/comentarios/${tareaId}`;
            let comentarios="";
            let array=[];
            
            axios.get(url,{tareaId})
            .then(function(respuesta){
                if(respuesta.status===200){
                  array=respuesta.data;
                  comentarios=dibujarListado(array,comentarios);
                  const urlCargarComentario=`${location.origin}/comentarios/${tareaId}`;;

                  Swal.fire({
                    title: 'Comentarios',
                    html:`${comentarios}`,
                    input: 'textarea',
                    inputPlaceholder: 'Ingresá tu comentario aquí...',
                    inputAttributes: {
                      autocapitalize: 'off'
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Ingresar',
                    showLoaderOnConfirm: true,
                    preConfirm: (observacion) => {
                      axios.post(urlCargarComentario, {
                          observacion:observacion,
                          tareaId:tareaId
                      },
                     )
                      .then(function (response) {
                        console.log(response.data);
                      })
                      .catch(function (error) {
                        Swal.showValidationMessage(
                          `Request failed: ${error}`
                        )
                      });    
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                  }).then((result) => {
                    if (result.isConfirmed) {
                      Swal.fire({
                        title: `Se cargo con exito el comentario: ${result.value}`,
                      })
                    }
                  })

                }
            });

        }    
        //Eliminar
        if (e.target.classList.contains('fa-trash')) {
            const tareaHTML=e.target.parentElement.parentElement;
            const idTarea=tareaHTML.dataset.tarea;
            
            esResponsableDeProyectoEliminar(idTarea,tareaHTML);
        }

    });
}

function functionPasarTareaProceso(parrafoText, id,nombreEncargado,fechaVencimiento,idUsuarioLi) {
    
    const tareasProceso=document.querySelector('.listado-proceso');
    const ul =tareasProceso.children[1];
    const li = document.createElement("li");
    li.classList.add('tarea');
    li.setAttribute("data-tarea", id); // added line
    li.setAttribute("data-usuario", idUsuarioLi);
    li.innerHTML=`<p>${parrafoText}</p><span class="nombre-encargado-tarea">${nombreEncargado}</span><span class="tarea-fecha-vencimiento">${fechaVencimiento}</span><div class="acciones"><i class="fa fa-arrow-left" aria-hidden="true"></i><i class="fa fa-comment" aria-hidden="true"></i><i class="fa fa-play" aria-hidden="true"></i><i class="fa fa-arrow-right" aria-hidden="true"></i><i class="fa fa-trash" aria-hidden="true"></i><i class="fa fa-edit" aria-hidden="true"</i></div>`
    ul.appendChild(li);
  }

  function dibujarListado(array,comentarios){
    comentarios=`<ul>`;
    //console.log(array);
    let fecha;
    array.forEach(element => {
      fecha=new Date(element.createdAt);
      fecha=`${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}`;
      comentarios+=`<li class='cuadro-comentario'><span><strong>${element.usuario.email}</strong></span> <span>${fecha}</span><p>${element.observacion}</p></li>`;
    });
    comentarios+=`</ul>`;

    return comentarios;
  }

  function esResponsableDeProyectoEdit(tareaId,parrafoText){

    const url=`${location.origin}/es-responsable-proyecto/${tareaId}`;
    let arrayResponsableProyecto=[];

    axios.get(url,{tareaId})
            .then(function(respuesta){
                if(respuesta.status===200){
                  arrayResponsableProyecto=respuesta.data;

                  if(arrayResponsableProyecto.length>0){
                    
                    document.querySelector('.agregar-tarea').style.display = "none";
                    document.querySelector('.editar-tarea').style.display = "block";

                    const inputNombreTarea=document.querySelector('#nombreTareaEdit');
                    const inputidTarea=document.querySelector('#tareaId');
                    const inputFecha=document.querySelector('#fechaEditTarea');

                    inputNombreTarea.value=parrafoText;
                    inputidTarea.value=tareaId;
                    inputFecha.value=fechaVencimiento;
                  }else{
                    
                    Swal.fire({
                      icon: 'error',
                      title: 'Lo siento',
                      text: 'Usted no puede editar las tareas, no es responsable del proyecto!',
                    });
                  }
                  

                }
            });
  }

  function esResponsableDeProyectoEliminar(tareaId,tareaHTML){

    const url=`${location.origin}/es-responsable-proyecto/${tareaId}`;
    let arrayResponsableProyecto=[];

    axios.get(url,{tareaId})
            .then(function(respuesta){
                if(respuesta.status===200){
                  arrayResponsableProyecto=respuesta.data;

                  if(arrayResponsableProyecto.length>0){
                   
                    Swal.fire({
                      title: 'Deseas borrar esta tarea?',
                      text: "La tarea eliminada no se puede recuperar!",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#3085d6',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Si, borrar!',
                      cancelButtonText:'No, cancelar',
                    }).then((result) => {
                      if (result.isConfirmed) {
                          //Enviar petición a axios
                          const url=`${location.origin}/tareas/${tareaId}`;
                          axios.delete(url,{params:{tareaId}})
                              .then(function(respuesta){
                                 if (respuesta.status===200) {
  
                                      Swal.fire(
                                          'Eliminado!',
                                          respuesta.data,
                                          'success'
                                      );
  
                                     //Eliminar el nodo
                                     tareaHTML.parentElement.removeChild(tareaHTML);
                                     actualizarAvance();      
                                 }
                                   
                              }).catch(()=>{
                                  Swal.fire({
                                      type:'error',
                                      title:'Hubo un error',
                                      text:'No se pudo eliminar la tarea'
                                  })
                              })
          
                      }
                    });
                    
                  }else{
                    
                    Swal.fire({
                      icon: 'error',
                      title: 'Lo siento',
                      text: 'Usted no puede eliminar las tareas, no es responsable del proyecto!',
                    });
                  }
                  

                }
            });
  }


export default tareasEspera;