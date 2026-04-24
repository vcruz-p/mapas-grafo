<script setup lang="ts">
import { ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'

const props = defineProps<{
  map: maplibregl.Map | null
}>()

const emit = defineEmits<{
  (e: 'layer-change', layerName: string): void
}>()

// =====================
// STATE
// =====================
const isOpen = ref(false)

const satelliteEnabled = ref(false)
const radioEnabled = ref(false)

// =====================
// SOURCES
// =====================
const TILE_PROXY =
  'http://192.168.83.128:8085/tile/{z}/{x}/{y}.png'

const SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

const RADIO_PM =
  'pmtiles://http://192.168.83.128:8086/radio/cuba.pmtiles'

// =====================
// SAFE LOAD
// =====================
function onReady(map: maplibregl.Map, fn: () => void) {
  if (map.isStyleLoaded()) fn()
  else map.once('load', fn)
}

// =====================
// INIT BASE LAYERS (UNA SOLA VEZ)
// =====================
function setupBaseLayers(map: maplibregl.Map) {
  // STREET
  map.addSource('street', {
    type: 'raster',
    tiles: [TILE_PROXY],
    tileSize: 256,
  })

  map.addLayer({
    id: 'street-layer',
    type: 'raster',
    source: 'street',
    layout: { visibility: 'visible' },
  })

  // SATELLITE
  map.addSource('sat', {
    type: 'raster',
    tiles: [SATELLITE],
    tileSize: 256,
  })

  map.addLayer({
    id: 'sat-layer',
    type: 'raster',
    source: 'sat',
    layout: { visibility: 'none' },
  })
}

// =====================
// RADIO LAYERS
// =====================
function setupRadio(map: maplibregl.Map) {
  // Verificar si ya existe para evitar duplicados
  if (map.getSource('radio')) return

  map.addSource('radio', {
    type: 'vector',
    url: RADIO_PM,
  })

  map.addLayer({
    id: 'radio-towers',
    type: 'symbol',
    source: 'radio',
    'source-layer': 'cells',
    layout: {
      'text-field': '📡',
      'text-size': 18,
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': '#f97316',
    },
  })

  map.on('click', 'radio-towers', (e) => createPopup(map, e))

  map.on('mouseenter', 'radio-towers', () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'radio-towers', () => {
    map.getCanvas().style.cursor = ''
  })
}

// =====================
// REMOVE RADIO LAYERS
// =====================
function removeRadio(map: maplibregl.Map) {
  // Remover listeners primero
  map.off('click', 'radio-towers')
  map.off('mouseenter', 'radio-towers')
  map.off('mouseleave', 'radio-towers')

  // Remover layer si existe
  if (map.getLayer('radio-towers')) {
    map.removeLayer('radio-towers')
  }

  // Remover source si existe
  if (map.getSource('radio')) {
    map.removeSource('radio')
  }
}

// =====================
// POPUP ROBUSTO
// =====================
function createPopup(map: maplibregl.Map, e: any) {
  const feature = e.features?.[0]
  if (!feature) return

  const p = feature.properties ?? {}

  const cellId = p.cell_id ?? p.cellid ?? p.id ?? 'N/A'
  const name = p.cell_name ?? p.name ?? 'N/A'
  const tech = p.tech ?? p.technology ?? 'N/A'
  const azimuth = p.azimuth ?? p.azi ?? 'N/A'

  new maplibregl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`
      <div style="font-size:12px; line-height:1.4">
        <b>📡 Torre Celular</b><br/>
        <b>ID:</b> ${cellId}<br/>
        <b>Nombre:</b> ${name}<br/>
        <b>Tecnología:</b> ${tech}<br/>
        <b>Azimuth:</b> ${azimuth}°
      </div>
    `)
    .addTo(map)
}

// =====================
// TOGGLES (SOLO VISIBILITY)
// =====================
function setSatellite(map: maplibregl.Map, enabled: boolean) {
  satelliteEnabled.value = enabled

  map.setLayoutProperty(
    'sat-layer',
    'visibility',
    enabled ? 'visible' : 'none'
  )

  emit('layer-change', 'satellite')
}

function setRadio(map: maplibregl.Map, enabled: boolean) {
  radioEnabled.value = enabled

  if (enabled) {
    // Si no existe el layer, lo creamos
    if (!map.getLayer('radio-towers')) {
      setupRadio(map)
    }
    map.setLayoutProperty(
      'radio-towers',
      'visibility',
      'visible'
    )
  } else {
    // Cuando se desactiva, removemos completamente los layers
    removeRadio(map)
  }

  emit('layer-change', 'radiobases')
}

// =====================
// INIT
// =====================
watch(
  () => props.map,
  (map) => {
    if (!map) return

    onReady(map, () => {
      setupBaseLayers(map)
      // No inicializamos radio aquí, se carga solo cuando se activa

      // OFF por defecto
      setSatellite(map, false)
      setRadio(map, false)
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="layer-control">

    <button class="layer-toggle" @click="isOpen = !isOpen">
      🗺️
    </button>

    <div v-if="isOpen" class="panel">

      <div class="panel-header">Capas</div>

      <!-- SATÉLITE -->
      <button
        class="layer-item"
        @click="props.map && setSatellite(props.map, !satelliteEnabled)"
      >
        🛰️ Satélite
        <span class="hint">
          {{ satelliteEnabled ? 'ON' : 'OFF' }}
        </span>
      </button>

      <!-- RADIO -->
      <button
        class="layer-item"
        @click="props.map && setRadio(props.map, !radioEnabled)"
      >
        📡 Radiobases
        <span class="hint">
          {{ radioEnabled ? 'ON' : 'OFF' }}
        </span>
      </button>

    </div>
  </div>
</template>

<style scoped>
.layer-control {
  position: relative;
  font-family: system-ui;
}

.layer-toggle {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: none;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  font-size: 18px;
}

.panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 240px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
  overflow: hidden;
}

.panel-header {
  padding: 10px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  background: #f8fafc;
}

.layer-item {
  width: 100%;
  padding: 12px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: 0.2s;
}

.layer-item:hover {
  background: #f1f5f9;
}

.hint {
  float: right;
  font-size: 12px;
  color: #64748b;
}
</style>