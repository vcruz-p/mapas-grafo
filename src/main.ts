import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'  // ✅ ESTO FALTA
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'

// REGISTRAR PROTOCOLO
const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

createApp(App).mount('#app')