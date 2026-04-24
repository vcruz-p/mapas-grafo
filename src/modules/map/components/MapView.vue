<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

const DEFAULT_COORDS: Coordinates = {
  lat: 23.1136,
  lng: -82.3666,
}

// ===================== PROPS =====================
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

const routingEnabled = ref(false)
const radioEnabled = ref(false)

// ===================== MAP STATE =====================
let map: maplibregl.Map | null = null

let start: Coordinates | null = null
let end: Coordinates | null = null

let startMarker: maplibregl.Marker | null = null
let endMarker: maplibregl.Marker | null = null

const routeId = 'route-layer'

// ===================== SAFE CHECK =====================
function isValid(c: Coordinates | null): c is Coordinates {
  return !!c && typeof c.lng === 'number' && typeof c.lat === 'number'
}

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

// ===================== MOVE MAP =====================
function moveTo(coords: Coordinates) {
  if (!map) return

  map.flyTo({
    center: [coords.lng, coords.lat],
    zoom: props.zoom,
  })
}

// ===================== START MARKER =====================
function setStart(coords: Coordinates) {
  start = coords

  if (!startMarker) {
    startMarker = new maplibregl.Marker({ color: '#2563eb' })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map!)
  } else {
    startMarker.setLngLat([coords.lng, coords.lat])
  }
}

// ===================== END MARKER =====================
function setEnd(coords: Coordinates) {
  end = coords

  if (!endMarker) {
    endMarker = new maplibregl.Marker({
      element: createFinishMarker(),
      anchor: 'bottom',
    }).addTo(map!)
  }

  endMarker.setLngLat([coords.lng, coords.lat])
}

// ===================== CLICK LOGIC =====================
async function handleMapClick(e: maplibregl.MapMouseEvent) {
  if (!map) return

  const coords: Coordinates = {
    lat: e.lngLat.lat,
    lng: e.lngLat.lng,
  }

  // 1️⃣ FIRST CLICK → START
  if (!start) {
    setStart(coords)
    return
  }

  // 2️⃣ SECOND CLICK → END
  if (!end) {
    setEnd(coords)

    if (isValid(start) && isValid(end)) {
      await drawRoute(start, end)
    }

    return
  }

  // 3️⃣ NEXT CLICKS → MOVE DESTINATION
  setEnd(coords)

  if (isValid(start) && isValid(end)) {
    await drawRoute(start, end)
  }
}

// ===================== ROUTE =====================
async function drawRoute(from: Coordinates, to: Coordinates) {
  if (!map) return

  const route = await getRoute(from, to)
  if (!route?.geometry?.coordinates?.length) return

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
}

// ===================== 🏁 FINISH MARKER =====================
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

  moveTo(coords)
}

// ===================== CONTROLS =====================
function zoomIn() { map?.zoomIn() }
function zoomOut() { map?.zoomOut() }

function clearRoute() {
  if (!map) return

  if (map.getLayer(routeId)) map.removeLayer(routeId)
  if (map.getSource(routeId)) map.removeSource(routeId)

  start = null
  end = null

  startMarker?.remove()
  endMarker?.remove()

  startMarker = null
  endMarker = null
}

// ===================== LOAD =====================
async function load() {
  let coords: Coordinates

  if (props.coordinates) coords = props.coordinates
  else if (props.address) coords = await resolveAddress(props.address)
  else coords = DEFAULT_COORDS

  initMap(coords)
}

// ===================== LIFECYCLE =====================
onMounted(load)

onUnmounted(() => {
  map?.remove()
})
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
        @clear-route="clearRoute"
      />
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
</style>