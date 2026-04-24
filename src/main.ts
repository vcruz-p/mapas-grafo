import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import maplibregl from 'maplibre-gl'

import { createPinia } from 'pinia'

// ===================== PINIA =====================
const pinia = createPinia()

// ===================== PMTILES =====================
async function initPmtiles() {
  const { Protocol } = await import('pmtiles')
  const protocol = new Protocol()

  // @ts-ignore
  maplibregl.addProtocol('pmtiles', protocol.tile)
}

// ===================== APP BOOTSTRAP =====================
async function bootstrap() {
  await initPmtiles()

  const app = createApp(App)

  app.use(pinia)

  app.mount('#app')
}

bootstrap()