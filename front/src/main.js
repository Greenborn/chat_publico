import { createApp } from 'vue'
import App from './App.vue'

import BootstrapVue3 from 'bootstrap-vue-3'
import BootstrapIcon from '@dvuckovic/vue3-bootstrap-icons'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

let vue = createApp(App)
vue.use(BootstrapVue3)
vue.component('BootstrapIcon', BootstrapIcon);

vue.mount('#app')
