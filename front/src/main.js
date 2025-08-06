import { createApp } from 'vue'
import App from './App.vue'


import BootstrapIcon from '@dvuckovic/vue3-bootstrap-icons'

import 'bootstrap/dist/css/bootstrap.css'

import './assets/dark-greenborn.css'
import './assets/custom-greenborn.css'

let vue = createApp(App)
vue.component('BootstrapIcon', BootstrapIcon);

vue.mount('#app')
