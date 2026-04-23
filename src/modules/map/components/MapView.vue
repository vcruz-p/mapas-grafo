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
import MapLayers from './MapLayers.vue'
import MapSearch from './MapSearch.vue'

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
// HANDLE SELECT FROM MAPSEARCH
// =====================
function handleSelect(coords: { lat: number; lng: number; label: string }) {
  moveTo(coords)
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
    <!-- CONTROLS VERTICAL (RIGHT SIDE) -->
    <!-- ===================== -->
    <div class="controls-vertical">
      
      <!-- SEARCH (TOP) -->
      <MapSearch 
        @select="handleSelect"
        class="search-component"
      />

      <!-- LAYERS (BELOW SEARCH) -->
      <div class="layers-container">
        <MapLayers :map="map" @layer-change="console.log('Capa cambiada:', $event)" />
      </div>

      <!-- CONTROLS (BELOW LAYERS) -->
      <div class="controls-container">
        <MapControls
          v-model:routingEnabled="routingEnabled"
          @center="centerMarker"
          @reset="resetView"
          @clear-route="clearRoute"
        />
      </div>

    </div>

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
/* CONTROLS VERTICAL (RIGHT SIDE) */
/* ===================== */
.controls-vertical {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* SEARCH COMPONENT */
.search-component {
  /* Search has its own internal positioning */
}

/* LAYERS */
.layers-container {
  /* No absolute positioning - flows in flex container */
}

/* CONTROLS */
.controls-container {
  /* No absolute positioning - flows in flex container */
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