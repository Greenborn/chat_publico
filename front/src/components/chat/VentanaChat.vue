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
            <label for="input-msg" class="form-label visually-hidden">Mensaje</label>
            <input
                  id="input-msg"
                  ref="inputMsgRef"
                  v-model="chat.mensaje.texto"
                  type="text" class="form-control"
                  placeholder="Mensaje"
                  required>
          </div>

          <div class="col-auto">
            <button class="btn btn-success" @click="enviarMensaje( chat )">Enviar</button>
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
            <div v-if="modal.error" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ modal.error }}
              <button type="button" class="btn-close" aria-label="Cerrar" v-on:click="modal.error = ''"></button>
            </div>
            
            <div class="row mb-3">
              <div class="col">
                <label for="input-nombre" class="form-label visually-hidden">Nombre de usuario</label>
                <input
                  id="input-nombre"
                  ref="inputNombreRef"
                  v-model="modelo_registro.nombre"
                  type="text" class="form-control"
                  placeholder="Nombre"
                  required>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <button class="btn btn-success" @click="registrarse()">Registrarse</button>
              </div>
            </div>
  
          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { conexionOk } from '../../conexionStore.js';
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
    mostrar: false,
    error: ''
  })

  // conexionOk ahora es global y reactivo
  const conexion = ref({})
  let reconnectAttempts = 0
  const maxReconnectAttempts = 10
  const reconnectBaseDelay = 1000 // ms
  const estadoConexion = ref('')
  const inputMsgRef = ref(null)
  const inputNombreRef = ref(null)

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
    if (!modelo_registro.value.nombre || modelo_registro.value.nombre.length < 4) {
      modal.value.error = 'El nombre de usuario debe tener al menos 4 caracteres.';
      return;
    }
    if (modelo_registro.value.nombre.length > 36) {
      modal.value.error = 'El nombre de usuario no puede superar los 36 caracteres.';
      return;
    }
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

  function mostrarEstado(mensaje) {
    estadoConexion.value = mensaje
  }

  function cerrarModalEstado() {
    // eliminado
  }

  function abrirModalRegistro() {
    modal.value.mostrar = true
    nextTick(() => {
      if (inputNombreRef.value) inputNombreRef.value.focus()
    })
  }

  function conectarWebSocket() {
    mostrarEstado('Conectando...')

    conexion.value = new WebSocket(import.meta.env.VITE_APP_API_URL)

    conexion.value.onopen = function() {
      conexionOk.value = true
      mostrarEstado('Conectado')
      reconnectAttempts = 0
    }

    conexion.value.onclose = function() {
      conexionOk.value = false
      mostrarEstado('Desconectado. Reintentando...')
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++
        setTimeout(conectarWebSocket, reconnectBaseDelay * Math.pow(2, reconnectAttempts))
      } else {
        mostrarEstado('No se pudo reconectar al servidor.')
      }
    }

    conexion.value.onerror = function() {
      conexionOk.value = false
      mostrarEstado('Error de conexión. Reintentando...')
      conexion.value.close()
    }

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
            if (msgRec.error) {
              modal.value.error = msgRec.error;
            } else {
              datos_usuario.value = msgRec
              modal.value.mostrar = false
              chats_abiertos.value[0].id = msgRec.id_sala
              chats_dir.value[ msgRec.id_sala ] = chats_abiertos.value[0]
              modal.value.error = ''
            }
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
            mostrarEstado(msgRec.msg)
          break;

          case 'reporte_online':
            if (chats_dir.value[msgRec.id_sala] !== undefined)
              chats_dir.value[msgRec.id_sala].online = msgRec.reporte
          break;
        }
        
      }

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
      abrirModalRegistro()
    }

    conectarWebSocket()
  })

</script>

<style scoped>
.mensaje-cont{
  height: 60vh;
  border: 1px solid #000;
  overflow-x: hidden;
  overflow-y: scroll;
}

.modal {
  display: block;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0,0,0,0) !important;
  border: 0 !important;
}
</style>
