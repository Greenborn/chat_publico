<template>
  <div class="conectados-list col-5 col-sm-4 col-md-3 col-xxl-2">
    <div claSS="row conectados-tit">
      <div class="col">
        Conectados ({{online.length}})
      </div>
    </div>
    <div class="row align-items-center lista-personas mt-2" 
          v-for="(user) in online" :key="user"
          @click="ir_sala_privada(user)"
          :class="{ 'yo-connect': user == datos_usuario.nombre }">
      <div class="col-auto">
        <BootstrapIcon icon="person-circle" size="2x" />
      </div>
      <div class="col pb-2 pt-2">
        {{user}}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const props = defineProps(['online', 'datos_usuario'])
  const emit  = defineEmits(['ir_sala_privada'])
  const conectados = ref([])

  function ir_sala_privada( user ){
    if ( user == props.datos_usuario.nombre ){
      return
    }
    emit('ir_sala_privada', user)
  }

  onMounted(async ()=>{
    conectados.value = props.online
  })
</script>

<style scoped>
.conectados-list{
  overflow-x: hidden;
  overflow-y: scroll;
  height: 60vh;
}

.conectados-tit{
  background: #198735;
  color: #FFF;
}

.lista-personas{
  user-select: none;
  cursor: pointer;
}

.lista-personas:hover{
  border-left: .5rem solid #078103;
}

.lista-personas .bi { margin: 0px; }

.yo-connect{
  background-color: #9bfff7;
}
</style>