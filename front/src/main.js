import { createApp } from 'vue'
import App from './App.vue'
import '@dvuckovic/vue3-bootstrap-icons/dist/style.css';




import { BootstrapIcon } from '@dvuckovic/vue3-bootstrap-icons';
import { injectBootstrapIcons } from '@dvuckovic/vue3-bootstrap-icons/utils';
import BootstrapIcons from 'bootstrap-icons/bootstrap-icons.svg?raw';

injectBootstrapIcons(BootstrapIcons);

import 'bootstrap/dist/css/bootstrap.css'

import './assets/modern-greenborn.css'

let vue = createApp(App)
vue.component('BootstrapIcon', BootstrapIcon);

vue.mount('#app')
