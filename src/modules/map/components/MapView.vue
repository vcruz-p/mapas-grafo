<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

import type { Coordinates } from '../types/map.types'
import { useMap } from '../composables/useMap'
import { getRoute } from '../services/map.service'

import MapControls from './MapControls.vue'

// =====================
// LEAFLET ICON FIX
// =====================
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// =====================
// TILE SERVER
// =====================
const TILE =
  import.meta.env.VITE_TILE_URL ||
  'http://192.168.83.128:8081/tile/{z}/{x}/{y}.png'

const DEFAULT_COORDS: Coordinates = {
  lat: 23.1136,
  lng: -82.3666,
}

// =====================
const props = withDefaults(
  defineProps<{
    coordinates?: Coordinates
    address?: string
    zoom?: number
    label?: string
  }>(),
  { zoom: 13 }
)

// =====================
// COMPOSABLE
// =====================
const { resolveAddress } = useMap()

// =====================
// STATE
// =====================
const mapRef = ref<HTMLDivElement | null>(null)
const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')

const routingEnabled = ref(true)

// SEARCH UI
const searchOpen = ref(false)
const searchValue = ref('')

// =====================
// LEAFLET STATE
// =====================
let map: L.Map | null = null
let marker: L.Marker | null = null
let routeLayer: L.GeoJSON | null = null
let clickPoints: Coordinates[] = []
let lastCenter: Coordinates | null = null
let clickHandler: any = null
let markers: L.Marker[] = []

// =====================
// MOVE MAP
// =====================
function moveTo(coords: Coordinates) {
  if (!map) return

  map.setView([coords.lat, coords.lng], props.zoom)

  if (marker) {
    marker.setLatLng([coords.lat, coords.lng])
  }
}

// =====================
// CONTROLS
// =====================
function resetView() {
  if (lastCenter && map) {
    map.setView([lastCenter.lat, lastCenter.lng], props.zoom)
  }
}

function centerMarker() {
  if (marker && map) {
    map.setView(marker.getLatLng(), map.getZoom())
  }
}

function clearRoute() {
  routeLayer?.remove()
  routeLayer = null
  clickPoints = []
}

// =====================
// ROUTE
// =====================
async function drawRoute(from: Coordinates, to: Coordinates) {
  const route = await getRoute(from, to)
  if (!route?.geometry) return

  routeLayer?.remove()

  routeLayer = L.geoJSON(route.geometry, {
    style: { color: '#3b82f6', weight: 4 },
  }).addTo(map!)

  map!.fitBounds(routeLayer.getBounds(), { padding: [40, 40] })
}

// =====================
// INIT MAP
// =====================
function initMap(coords: Coordinates) {
  if (!mapRef.value) return

  if (!map) {
    map = L.map(mapRef.value).setView([coords.lat, coords.lng], props.zoom)

    L.tileLayer(TILE, {
      attribution: 'Map',
      maxZoom: 19,
    }).addTo(map)

    clickHandler = async (e: L.LeafletMouseEvent) => {
      if (!routingEnabled.value) return

      const c: Coordinates = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      }

      clickPoints.push(c)

      const m = L.marker([c.lat, c.lng]).addTo(map!)
      markers.push(m)

      if (clickPoints.length === 2) {
        await drawRoute(clickPoints[0], clickPoints[1])
        clickPoints = []
      }
    }

    map.on('click', clickHandler)
  }

  lastCenter = coords
  moveTo(coords)
}

// =====================
// LOAD
// =====================
async function load() {
  status.value = 'loading'

  try {
    let coords: Coordinates

    if (props.coordinates) coords = props.coordinates
    else if (props.address) coords = await resolveAddress(props.address)
    else coords = DEFAULT_COORDS

    initMap(coords)
    status.value = 'ok'
  } catch {
    status.value = 'error'
  }
}

// =====================
// SEARCH (lat,lng o address)
// =====================
async function handleSearch() {
  const value = searchValue.value.trim()
  if (!value) return

  try {
    if (value.includes(',')) {
      const [lat, lng] = value.split(',').map(v => Number(v.trim()))
      if (!isNaN(lat) && !isNaN(lng)) {
        moveTo({ lat, lng })
        searchOpen.value = false
        return
      }
    }

    const coords = await resolveAddress(value)
    moveTo(coords)
    searchOpen.value = false

  } catch {
    console.error('Search error')
  }
}

// =====================
// LIFECYCLE
// =====================
onMounted(load)

onUnmounted(() => {
  if (map && clickHandler) map.off('click', clickHandler)
  markers.forEach(m => m.remove())
  map?.remove()
})

watch(() => props.coordinates, val => {
  if (val) moveTo(val)
})

watch(() => props.address, load)
</script>

<template>
  <div class="map-wrapper">

    <!-- ===================== -->
    <!-- SEARCH (ARRIBA IZQUIERDA) -->
    <!-- ===================== -->
    <div class="search-box">
      <button class="search-btn" @click="searchOpen = !searchOpen">
        🔍
      </button>

      <div v-if="searchOpen" class="search-panel">
        <input
          v-model="searchValue"
          placeholder="Dirección o lat,lng"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">Ir</button>
      </div>
    </div>

    <!-- ===================== -->
    <!-- CONTROLES (ABAJO DERECHA) -->
    <!-- ===================== -->
    <MapControls
      v-model:routingEnabled="routingEnabled"
      @center="centerMarker"
      @reset="resetView"
      @clear-route="clearRoute"
    />

    <!-- LOADING -->
    <div v-if="status === 'loading'" class="overlay">
      Cargando mapa...
    </div>

    <!-- MAPA -->
    <div ref="mapRef" class="leaflet-map" />
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* MAP */
.leaflet-map {
  width: 100%;
  height: 100%;
}

/* ===================== */
/* SEARCH (TOP LEFT) */
/* ===================== */
.search-box {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.search-panel {
  display: flex;
  gap: 6px;
}

.search-panel input {
  width: 220px;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #d11c1c;
}

.search-panel button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}

/* ===================== */
/* OVERLAY */
/* ===================== */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
}
</style>