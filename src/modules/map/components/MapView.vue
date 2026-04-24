<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import type { Coordinates } from '../types/map.types'
import { useMap } from '../composables/useMap'
import { getRoute } from '../services/map.service'

import MapControls from './MapControls.vue'
import MapLayers from './MapLayers.vue'
import MapSearch from './MapSearch.vue'

// ===================== CONFIG =====================
const TILE =
  import.meta.env.VITE_TILE_URL ||
  'http://192.168.83.128:8085/tile/{z}/{x}/{y}.png'

const API =
  import.meta.env.VITE_API_URL || 'http://192.168.83.128:3000'

const DEFAULT_COORDS: Coordinates = {
  lat: 23.1136,
  lng: -82.3666,
}

const props = withDefaults(
  defineProps<{
    coordinates?: Coordinates
    address?: string
    zoom?: number
  }>(),
  { zoom: 13 }
)

const { resolveAddress } = useMap()

// ===================== STATE =====================
const mapRef = ref<HTMLDivElement | null>(null)
const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')

const routingEnabled = ref(false)
const radioEnabled = ref(false)

// ===================== MAP =====================
let map: maplibregl.Map | null = null

let startMarker: maplibregl.Marker | null = null
let endMarker: maplibregl.Marker | null = null

let clickPoints: Coordinates[] = []
let lastCenter: Coordinates | null = null

const routeId = 'route-layer'

// ===================== RADIO =====================
const RADIO_SOURCE = 'radio-source'
const RADIO_FILL = 'radio-fill'
const RADIO_LINE = 'radio-line'

// ===================== STYLE =====================
function baseStyle() {
  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: [TILE],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'osm',
        type: 'raster',
        source: 'osm',
      },
    ],
  } as maplibregl.StyleSpecification
}

// ===================== MOVE =====================
function moveTo(coords: Coordinates) {
  if (!map) return

  map.flyTo({
    center: [coords.lng, coords.lat],
    zoom: props.zoom,
  })

  if (!startMarker) {
    startMarker = new maplibregl.Marker({ color: '#2563eb' })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map)
  } else {
    startMarker.setLngLat([coords.lng, coords.lat])
  }
}

// ===================== RADIO =====================
function clearRadios() {
  if (!map) return

  if (map.getLayer(RADIO_FILL)) map.removeLayer(RADIO_FILL)
  if (map.getLayer(RADIO_LINE)) map.removeLayer(RADIO_LINE)
  if (map.getSource(RADIO_SOURCE)) map.removeSource(RADIO_SOURCE)
}

async function loadRadios(lat: number, lng: number) {
  if (!radioEnabled.value || !map) return

  try {
    clearRadios()

    const res = await fetch(`${API}/api/radio/coverage?lat=${lat}&lon=${lng}`)
    if (!res.ok) return

    const data = await res.json()
    if (!data?.features?.length) return

    map.addSource(RADIO_SOURCE, {
      type: 'geojson',
      data,
    })

    map.addLayer({
      id: RADIO_FILL,
      type: 'fill',
      source: RADIO_SOURCE,
      paint: {
        'fill-color': '#ff2d55',
        'fill-opacity': 0.25,
      },
    })

    map.addLayer({
      id: RADIO_LINE,
      type: 'line',
      source: RADIO_SOURCE,
      paint: {
        'line-color': '#ff2d55',
        'line-width': 1,
      },
    })
  } catch (e) {
    console.error(e)
  }
}

// ===================== CLICK =====================
function handleMapClick(e: maplibregl.MapMouseEvent) {
  if (!map) return

  const coords: Coordinates = {
    lat: e.lngLat.lat,
    lng: e.lngLat.lng,
  }

  // 🔵 START / UPDATE START MARKER
  if (!startMarker) {
    startMarker = new maplibregl.Marker({ color: '#2563eb' })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map)
  } else {
    startMarker.setLngLat([coords.lng, coords.lat])
  }

  if (radioEnabled.value) {
    loadRadios(coords.lat, coords.lng)
  }

  if (!routingEnabled.value) return

  clickPoints.push(coords)

  if (clickPoints.length === 2) {
    drawRoute(clickPoints[0], clickPoints[1])
    clickPoints = []
  }
}

// ===================== ROUTE =====================
async function drawRoute(from: Coordinates, to: Coordinates) {
  if (!map) return

  const route = await getRoute(from, to)
  if (!route?.geometry) return

  if (map.getLayer(routeId)) map.removeLayer(routeId)
  if (map.getSource(routeId)) map.removeSource(routeId)

  map.addSource(routeId, {
    type: 'geojson',
    data: route.geometry,
  })

  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    paint: {
      'line-color': '#3b82f6',
      'line-width': 4,
    },
  })

  // 🏁 META FINAL (FIN DE RUTA)
  const end = route.geometry.coordinates?.at(-1)

  if (end) {
    if (endMarker) endMarker.remove()

    endMarker = new maplibregl.Marker({
      element: createFinishMarker(),
      anchor: 'bottom',
    })
      .setLngLat(end)
      .addTo(map)
  }
}

// ===================== 🏁 CUSTOM FINISH MARKER =====================
function createFinishMarker() {
  const el = document.createElement('div')
  el.innerHTML = '🏁'
  el.style.fontSize = '22px'
  el.style.filter = 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))'
  return el
}

// ===================== INIT =====================
function initMap(coords: Coordinates) {
  if (!mapRef.value) return

  if (!map) {
    map = new maplibregl.Map({
      container: mapRef.value,
      style: baseStyle(),
      center: [coords.lng, coords.lat],
      zoom: props.zoom,
    })

    map.on('click', handleMapClick)
  }

  lastCenter = coords
  moveTo(coords)
}

// ===================== CONTROLS =====================
function zoomIn() { map?.zoomIn() }
function zoomOut() { map?.zoomOut() }

function resetView() {
  if (!map || !lastCenter) return
  map.flyTo({ center: [lastCenter.lng, lastCenter.lat], zoom: props.zoom })
}

function centerMarker() {
  if (!map || !startMarker) return
  map.flyTo({ center: startMarker.getLngLat() })
}

function clearRoute() {
  if (!map) return

  if (map.getLayer(routeId)) map.removeLayer(routeId)
  if (map.getSource(routeId)) map.removeSource(routeId)

  if (endMarker) {
    endMarker.remove()
    endMarker = null
  }

  clickPoints = []
}

// ===================== LOAD =====================
async function load() {
  status.value = 'loading'

  try {
    let coords: Coordinates

    if (props.coordinates) coords = props.coordinates
    else if (props.address) coords = await resolveAddress(props.address)
    else coords = DEFAULT_COORDS

    initMap(coords)
    status.value = 'ok'
  } catch (e) {
    console.error(e)
    status.value = 'error'
  }
}

onMounted(load)

onUnmounted(() => {
  clearRadios()
  map?.remove()
})

watch(() => props.coordinates, v => {
  if (v) moveTo(v)
})

watch(() => props.address, load)
</script>

<template>
  <div class="map-wrapper">

    <div class="search-float">
      <MapSearch @select="moveTo" />
    </div>

    <div class="controls-vertical">
      <MapLayers :map="map" />

      <MapControls
        v-model:routingEnabled="routingEnabled"
        v-model:radioEnabled="radioEnabled"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @center="centerMarker"
        @reset="resetView"
        @clear-route="clearRoute"
      />
    </div>

    <div v-if="status === 'loading'" class="overlay">
      Cargando mapa...
    </div>

    <div ref="mapRef" class="maplibre-map" />
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.maplibre-map {
  width: 100%;
  height: 100%;
}

.search-float {
  position: absolute;
  top: 12px;
  right: 70px;
  z-index: 3000;
}

.controls-vertical {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>