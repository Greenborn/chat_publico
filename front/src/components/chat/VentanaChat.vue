<template>
  <div class="row">
    <div class="col-12 p-2">
<!--Tabs Salas de chat-->
      <ul class="nav nav-tabs">
        <li class="nav-item"
            v-for="(chat) in chats_abiertos" :key="chat">
          <a class="nav-link" :class="{ active: chat.activa }">
            <span @click="click_tab(chat)">{{chat.titulo}} &nbsp;</span>

            <BootstrapIcon 
              v-if="chat.es_privada"
              @click="cerrar_chat(chat)"
              icon="x-circle-fill" />
          </a>
        </li>
      </ul>
    </div>
<!--Contenido Tabs-->
    <div class="w-100"
      v-for="(chat) in chats_abiertos" :key="chat">
      
      <div 
        v-if="chat.activa"
        class="col-12">
        <div class="row">
          <div class="col col-sm-8 col-md-9 col-xxl-10 mensaje-cont">

            <div class="row" v-for="(msg) in chat.mensajes" :key="msg">
              <div class="col">
                <span class="badge" :class="{ 'bg-secondary':msg.autor.id != datos_usuario.id, 'bg-primary': msg.autor.id == datos_usuario.id }">{{msg.autor.nombre}}:</span> {{msg.texto}}
              </div>
            </div>

          </div>

          <ListaContactos 
            :online="chat.online" :datos_usuario="datos_usuario" @ir_sala_privada="ir_sala_privada"></ListaContactos>
        </div>

        <div class="row mt-3">
          <div class="col">
            <b-form-input
                  id="input-msg"
                  v-model="chat.mensaje.texto"
                  type="text" placeholder="Mensaje"
                  required></b-form-input>
          </div>

          <div class="col-auto">
            <b-button variant="success" @click="enviarMensaje( chat )">Enviar</b-button>
          </div>
        </div>
      </div>
     
    </div>
  </div>  

  <div class="app-modal h-100" v-if="modal.mostrar">
    <div class="row h-100">
      <div class="mt-auto mb-auto col-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-4 offset-lg-4">

        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Ingrese el nombre a mostrar</h5>
          </div>
          <div class="card-body">
            
            <div class="row mb-3">
              <div class="col">
                <b-form-input
                  id="input-nombre"
                  v-model="modelo_registro.nombre"
                  type="text" placeholder="Nombre"
                  required></b-form-input>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <b-button variant="success" @click="registrarse()">Registrarse</b-button>
              </div>
            </div>
  
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import ListaContactos from './ListaContactos.vue'

  const chats_abiertos = ref([])
  const chats_dir      = ref({})

  const datos_usuario = ref({
    id: -1,
    nombre: 'Juan Perez'
  })

  const modelo_registro = ref({
    nombre: ''
  })

  const modal = ref({
    mostrar: false
  })

  const conexion = ref({})

  function click_tab( chat ){
    for(let c=0; c < chats_abiertos.value.length; c++){
      chats_abiertos.value[c].activa = false
    }
    chat.activa = true
  }

  function cerrar_chat(chat){
    conexion.value.send( JSON.stringify( {
      accion: 'cerrar_chat',
      usuario: datos_usuario.value,
      id_sala: chat.id
    } ))

    let id = chat.id
    for (let c=0; c < chats_abiertos.value.length; c++){
      if (chats_abiertos.value[c].id == id){
        chats_abiertos.value.splice(c,1)
        break;
      }
    }
    delete chats_dir.value[id]
    
    click_tab(chats_abiertos.value[0])
  }

  function ir_sala_privada( usuario ){
    if (usuario == datos_usuario.value.nombre){
      console.log('No se permite iniciar un chat consigo mismo')
      return
    }

    for(let c=0; c < chats_abiertos.value.length; c++){
      if (chats_abiertos.value[c].usuario == usuario){
        console.log('No se admite abrir dos chats con la misma persona')
        return
      }
    }

    let registro = {
      nombre_origen: modelo_registro.value.nombre,
      nombre_destino: usuario,
      id_sala_root: datos_usuario.value.id_sala,
      accion: 'registro_sala_privada'
    }
    conexion.value.send( JSON.stringify( registro ));
  }

  function registrarse(){
    let registro = {
      nombre: modelo_registro.value.nombre,
      accion: 'registro'
    }
    conexion.value.send( JSON.stringify( registro ));
  }

  function enviarMensaje( chat ){
    if (chat.mensaje.texto !== ''){
      if (chat.es_privada){
        chat.mensaje.accion     = 'mensaje_privado'
        chat.mensaje['destino'] = chat.usuario
      }
      chat.mensaje['id_sala'] = chat.id
      chat.mensaje.autor = datos_usuario.value
      conexion.value.send( JSON.stringify( chat.mensaje ))
      chat.mensaje.texto = ''
    }
  }

  onMounted(async ()=>{
    chats_abiertos.value.push({
      'id': '',
      'activa': true,
      'online': [],
      'mensaje': {
        texto: '',
        accion: 'mensaje',
        autor: {}
      },
      'es_privada': false,
      'usuario': '',
      'mensajes': [],
      'titulo': 'Chat general'
    })

    if (datos_usuario.value.id == -1){
      modal.value.mostrar = true
    }

    conexion.value = new WebSocket( import.meta.env.VITE_APP_API_URL )

    conexion.value.onmessage = function(event) {
      let msgRec = null
      try {
        msgRec = JSON.parse(event.data)
      } catch (error) {
        console.log(error)
      }

      if (msgRec !== null){
        //console.log(msgRec)
        switch(msgRec.accion){
          case 'mensaje':
            if (chats_dir.value[msgRec.id_sala] !== undefined)
              chats_dir.value[msgRec.id_sala].mensajes.push( msgRec )
          break;

          case 'mensaje_privado':
            if (chats_dir.value[msgRec.id_sala] !== undefined)
              chats_dir.value[msgRec.id_sala].mensajes.push( msgRec )
          break;

          case 'mensaje_sys':
            if (chats_dir.value[msgRec.id_sala] !== undefined)
            chats_dir.value[msgRec.id_sala].mensajes.push( {
              texto: msgRec.msg,
              accion: 'mensaje_sys',
              autor: {
                id: -1,
                nombre: 'Sistema'
              }
            } )
          break;

          case 'registro':
            datos_usuario.value = msgRec
            modal.value.mostrar = false
            chats_abiertos.value[0].id = msgRec.id_sala
            chats_dir.value[ msgRec.id_sala ] = chats_abiertos.value[0]
          break;

          case 'registro_sala_privada':
            let otro_user = msgRec.iniciador
            if (msgRec.iniciador == datos_usuario.value.nombre)
              otro_user = msgRec.destino
            
            let nuevo_chat = {
              'id': msgRec.id_nueva_sala,
              'id_root': datos_usuario.value.id_sala,
              'activa': false,
              'online': [],
              'mensaje': {
                texto: '',
                accion: 'mensaje',
                autor: {}
              },
              'es_privada': true,
              'mensajes': [],
              'titulo': 'Chat con ' + otro_user
            }
            chats_abiertos.value.push(nuevo_chat)
            chats_dir.value[nuevo_chat.id] = nuevo_chat
          break;

          case 'alerta':
            alert(msgRec.msg)
          break;

          case 'reporte_online':
            if (chats_dir.value[msgRec.id_sala] !== undefined)
              chats_dir.value[msgRec.id_sala].online = msgRec.reporte
          break;
        }
        
      }

    }
  })

</script>

<style scoped>
.mensaje-cont{
  height: 60vh;
  border: 1px solid #000;
  overflow-x: hidden;
  overflow-y: scroll;
}

</style>
