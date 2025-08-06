<template>
  <div class="chat-outer-container dark-bg container-fluid px-2 px-md-4">
    <div class="row justify-content-center">
      <div class="col-12 col-md-10 col-lg-8 p-0">
        <!--Tabs Salas de chat-->
        <ul class="nav nav-tabs chat-tabs-dark rounded-top shadow-sm">
          <li class="nav-item" v-for="(chat) in chats_abiertos" :key="chat">
            <a class="nav-link px-4 py-2 fw-bold chat-tab-link-dark" :class="{ active: chat.activa }" @click="click_tab(chat)">
              <span>{{chat.titulo}} &nbsp;</span>
              <span v-if="chat.es_privada">
                <BootstrapIcon 
                  @click.stop="cerrar_chat(chat)"
                  icon="x-circle-fill"
                  size="md"
                  class="text-danger ms-1 pointer" />
              </span>
            </a>
          </li>
        </ul>

        <div class="chat-content-container-dark rounded-bottom shadow-lg">
          <div class="w-100" v-for="(chat) in chats_abiertos" :key="chat">
            <div v-if="chat.activa" class="col-12">
              <div class="row flex-nowrap">
                <div class="col col-sm-8 col-md-9 col-xxl-10 mensaje-cont-dark p-3 rounded-start">
                  <div class="msg-list">
                    <div class="msg-item mb-2 d-flex" v-for="(msg) in chat.mensajes" :key="msg">
                      <div class="msg-bubble px-3 py-2 rounded shadow-sm"
                        :class="msg.autor.id == datos_usuario.id ? 'bg-gradient-dark-green text-white align-self-end' : 'bg-dark-2 text-light align-self-start'">
                        <span class="fw-semibold">{{msg.autor.nombre}}:</span> <span>{{msg.texto}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ListaContactos 
                  :online="chat.online" :datos_usuario="datos_usuario" @ir_sala_privada="ir_sala_privada"
                  class="contactos-panel contactos-panel-dark border-start rounded-end shadow-sm px-2 py-3 d-none d-md-block" />
              </div>

              <div class="row mt-3 align-items-center">
                <div class="col">
                  <label for="input-msg" class="form-label visually-hidden">Mensaje</label>
                  <input
                    id="input-msg"
                    ref="inputMsgRef"
                    v-model="chat.mensaje.texto"
                    type="text"
                    class="form-control form-control-lg rounded-pill shadow-sm input-dark"
                    placeholder="Escribe tu mensaje..."
                    required
                    @keyup.enter="enviarMensaje(chat)"
                  >
                </div>
                <div class="col-auto">
                  <button class="btn btn-success btn-lg rounded-pill px-4 shadow-sm" @click="enviarMensaje(chat)">
                    <BootstrapIcon icon="send-fill" size="md" class="me-2" />Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de registro -->
    <div class="app-modal dark-modal-bg" v-if="modal.mostrar">
      <div class="modal-dialog-custom">
        <div class="card p-0 shadow-lg border-0 rounded-4 modal-card bg-dark text-white">
          <div class="card-header bg-gradient-dark-green text-white modal-header-dark rounded-top-4 border-0 text-center py-3 px-4">
            <h5 class="card-title mb-0">Ingrese el nombre a mostrar</h5>
          </div>
          <div class="card-body rounded-bottom-4 p-5">
            <div v-if="modal.error" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ modal.error }}
              <button type="button" class="btn-close btn-close-white" aria-label="Cerrar" v-on:click="modal.error = ''"></button>
            </div>
            <label for="input-nombre" class="form-label visually-hidden">Nombre de usuario</label>
            <input
              id="input-nombre"
              ref="inputNombreRef"
              v-model="modelo_registro.nombre"
              type="text"
              class="form-control form-control-lg rounded-pill shadow-sm mb-5 input-dark"
              placeholder="Nombre"
              required
              @keyup.enter="registrarse"
              autocomplete="off"
            >
            <button class="btn btn-success btn-lg rounded-pill w-100 shadow-sm" @click="registrarse()">Registrarse</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { conexionOk } from '../../conexionStore.js';
import ListaContactos from './ListaContactos.vue';


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
/* Estilos mejorados para el chat */

.dark-bg {
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #181c1f 0%, #23272b 100%);
  padding-top: 2rem;
  padding-bottom: 2rem;
  color: #e0e0e0;
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-tabs-dark {
  background: #23272b;
  border-bottom: 2px solid #222831;
}

.chat-tab-link-dark {
  color: #b0b8b8 !important;
  background: transparent !important;
  border: none;
  transition: background 0.2s, color 0.2s;
}
.chat-tab-link-dark.active, .chat-tab-link-dark:hover {
  color: #fff !important;
  background: #166534 !important;
  border: none;
}


.chat-content-container-dark {
  min-height: 70vh;
  background: #23272b;
  border-radius: 0 0 1rem 1rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 1.5rem 1rem 1rem 1rem;
  margin-bottom: 2rem;
  overflow-x: hidden;
}

.mensaje-cont-dark {
  height: 55vh;
  border: none;
  overflow-x: auto;
  overflow-y: auto;
  background: transparent;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
}

.msg-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.msg-item {
  width: 100%;
}


.msg-bubble {
  max-width: 95%;
  word-break: break-word;
  font-size: 1.05rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border-radius: 1.5rem 1.5rem 1.5rem 0.5rem;
  margin-bottom: 0.2rem;
  background: #23272b;
  color: #e0e0e0;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.bg-dark-2 {
  background: #23272b !important;
  color: #e0e0e0 !important;
}
.msg-bubble.align-self-end {
  margin-left: auto;
  border-radius: 1.5rem 1.5rem 0.5rem 1.5rem;
}


.contactos-panel-dark {
  min-width: 180px;
  max-width: 220px;
  background: #181c1f !important;
  color: #e0e0e0 !important;
  border-left: 1px solid #23272b !important;
  margin-left: 0.5rem;
}

.pointer {
  cursor: pointer;
}



.app-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.bg-gradient-dark-green {
  background: linear-gradient(90deg, #14532d 0%, #166534 100%) !important;
  color: #fff !important;
}

.modal-header-dark {
  border-top-left-radius: 1.25rem !important;
  border-top-right-radius: 1.25rem !important;
  padding-top: 1.2rem !important;
  padding-bottom: 1.2rem !important;
  background: linear-gradient(90deg, #14532d 0%, #166534 100%) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}

.dark-modal-bg {
  background: rgba(10, 20, 20, 0.92);
}

.modal-dialog-custom {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.modal-card {
  animation: modalFadeIn 0.4s cubic-bezier(.4,0,.2,1);
  background: #181c1f !important;
  color: #fff !important;
  border: 1px solid #222831;
}

.bg-gradient-dark-green {
  background: linear-gradient(90deg, #14532d 0%, #166534 100%) !important;
  color: #fff !important;
}

.input-dark {
  background: #23272b !important;
  color: #fff !important;
  border: 1px solid #2e3a3f !important;
  padding-left: 1.2rem !important;
  padding-right: 1.2rem !important;
}
.input-dark::placeholder {
  color: #b0b8b8 !important;
  opacity: 1;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.modal-card {
  animation: modalFadeIn 0.4s cubic-bezier(.4,0,.2,1);
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(40px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
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
