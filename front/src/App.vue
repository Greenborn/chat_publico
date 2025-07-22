<template>
  <div class="container">
    <AppHeader></AppHeader>
    <VentanaChat></VentanaChat>
    <AppFooter></AppFooter>
  </div>
  
</template>

<script setup>
  import VentanaChat from './components/chat/VentanaChat.vue'
  import AppHeader from './components/AppHeader.vue'
  import AppFooter from './components/AppFooter.vue'

</script>

<style>
#app{
  background: #444;
}

.container{
  background: #FFF;
  min-height: 100vh;
}

.app-modal{
  background:   rgba(0,0,0,.6);
  position:     fixed;
  top:          0px;
  left:         0px;
  width:        100vw;
  height:       100vh;
  z-index:      1000;
}
</style>
