<template>
  <div class="row header-cont">
    <div class="col">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark rounded mb-3">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Chat público Tandil</a>
          <span class="ms-auto d-flex align-items-center">
            <span :class="['badge', conexionOk ? 'bg-success' : 'bg-danger']" style="font-size:0.9em;">
              <span v-if="conexionOk">Conectado</span>
              <span v-else>Sin conexión</span>
            </span>
          </span>
        </div>
      </nav>
      <div v-if="showAlert" class="alert alert-warning alert-dismissible" role="alert" style="margin-bottom: 1rem;">
        <div class="row">

          <div class="col">
            Al usar este chat acepta que no existe moderación, que se usará con fines de prueba, y que toda comunicación realizada por este medio queda registrada en archivos de logs del sistema, se recomienda no mencionar información privada, contactos, etc.
          </div>

          <div class="col-1">
            <button type="button" class="close" aria-label="Cerrar" @click="showAlert = false" style="background: none; border: none; font-size: 1.5rem; float: right; line-height: 1;">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { conexionOk } from '../../src/conexionStore.js';
const showAlert = ref(true);
</script>

<style scoped>
.header-cont{
  user-select: none;
}

.alert {
  padding: 1rem;
  border: 1px solid #f0ad4e;
  background-color: #fcf8e3;
  color: #8a6d3b;
  border-radius: 4px;
  position: relative;
}
.alert .close {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  color: #8a6d3b;
  cursor: pointer;
}
</style>