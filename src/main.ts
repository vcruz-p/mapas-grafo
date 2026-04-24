import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import maplibregl from 'maplibre-gl'

// REGISTRAR PROTOCOLO - pmtiles se carga dinámicamente para evitar errores de tipos
async function initPmtiles() {
  const { Protocol } = await import('pmtiles')
  const protocol = new Protocol()
  // @ts-ignore
  maplibregl.addProtocol('pmtiles', protocol.tile)
}

initPmtiles()

createApp(App).mount('#app')