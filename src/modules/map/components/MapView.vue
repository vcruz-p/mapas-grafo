<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix iconos
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// 🔥 CONFIG CENTRAL
const API = 'http://192.168.83.128:3000'
const TILE = 'http://192.168.83.128:8080/styles/basic/{z}/{x}/{y}.png'

interface Coordinates {
  lat: number
  lng: number
}

const props = withDefaults(
  defineProps<{
    coordinates?: Coordinates
    address?: string
    zoom?: number
    label?: string
  }>(),
  {
    zoom: 13,
  }
)

const mapRef = ref<HTMLDivElement | null>(null)
const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
const errorMsg = ref('')

let map: L.Map | null = null
let marker: L.Marker | null = null
let routeLayer: L.GeoJSON | null = null
let clickPoints: Coordinates[] = []

// 🔎 GEOCODING (LOCAL)
async function geocode(address: string): Promise<Coordinates> {
  const res = await fetch(`${API}/api/search?q=${encodeURIComponent(address)}`)
  const data = await res.json()

  if (!data.length) throw new Error('No encontrado')

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  }
}

// 🧭 RUTA
async function drawRoute(from: Coordinates, to: Coordinates) {
  const res = await fetch(
    `${API}/api/route?from=${from.lng},${from.lat}&to=${to.lng},${to.lat}`
  )

  const data = await res.json()
  const geo = data.routes?.[0]?.geometry

  if (!geo) return

  if (routeLayer) routeLayer.remove()

  routeLayer = L.geoJSON(geo, {
    style: {
      color: '#2563eb',
      weight: 4,
    },
  }).addTo(map!)

  map!.fitBounds(routeLayer.getBounds())
}

// 🗺️ MAPA
function initMap(coords: Coordinates) {
  if (!mapRef.value) return

  if (!map) {
    map = L.map(mapRef.value).setView([coords.lat, coords.lng], props.zoom)

    L.tileLayer(TILE, {
      attribution: 'Cuba Offline Maps',
      maxZoom: 19,
    }).addTo(map)

    // 🖱️ CLICK PARA RUTAS
    map.on('click', async (e) => {
      const c = { lat: e.latlng.lat, lng: e.latlng.lng }

      clickPoints.push(c)

      L.marker([c.lat, c.lng]).addTo(map!)

      if (clickPoints.length === 2) {
        await drawRoute(clickPoints[0], clickPoints[1])
        clickPoints = []
      }
    })
  } else {
    map.setView([coords.lat, coords.lng], props.zoom)
  }

  if (marker) {
    marker.setLatLng([coords.lat, coords.lng])
  } else {
    marker = L.marker([coords.lat, coords.lng]).addTo(map!)
  }

  marker.bindPopup(props.label || props.address || 'Ubicación').openPopup()
}

// 🔄 LOAD
async function load() {
  status.value = 'loading'
  errorMsg.value = ''

  try {
    let coords: Coordinates

    if (props.coordinates) {
      coords = props.coordinates
    } else if (props.address) {
      coords = await geocode(props.address)
    } else {
      throw new Error('Se requiere coordinates o address')
    }

    initMap(coords)
    status.value = 'ok'
  } catch (e: any) {
    errorMsg.value = e.message
    status.value = 'error'
  }
}

onMounted(load)

onUnmounted(() => {
  map?.remove()
  map = null
})

watch(() => [props.coordinates, props.address], load)
</script>

<template>
  <div class="map-wrapper">
    
    <!-- Loading -->
    <Transition name="fade">
      <div v-if="status === 'loading'" class="map-overlay">
        <div class="spinner" />
        <span>Cargando mapa…</span>
      </div>
    </Transition>

    <!-- Error -->
    <Transition name="fade">
      <div v-if="status === 'error'" class="map-overlay map-overlay--error">
        <span>{{ errorMsg }}</span>
        <button class="retry-btn" @click="load">Reintentar</button>
      </div>
    </Transition>

    <!-- MAP -->
    <div ref="mapRef" class="leaflet-map" />

  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.leaflet-map {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(248, 250, 252, 0.9);
}

.map-overlay--error {
  color: red;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  padding: 6px 16px;
  border: 1px solid red;
  background: transparent;
  cursor: pointer;
}
</style>