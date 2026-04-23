<script setup lang="ts">
import { ref, watch } from 'vue'
import L from 'leaflet'

const props = defineProps<{
  map: L.Map | null
}>()

const emit = defineEmits<{
  (e: 'layer-change', layerName: string): void
}>()

// Capas disponibles
const baseLayers = ref([
  { name: 'Calles', id: 'streets', icon: '🗺️' },
  { name: 'Satélite', id: 'satellite', icon: '🛰️' },
  { name: 'Terreno', id: 'terrain', icon: '🏔️' },
  { name: 'Oscuro', id: 'dark', icon: '🌙' },
])

const activeLayer = ref('streets')
const isOpen = ref(false)

// URLs de tiles para diferentes capas
const tileLayers: Record<string, string> = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

const attributions: Record<string, string> = {
  streets: '© OpenStreetMap',
  satellite: '© ESRI World Imagery',
  terrain: '© OpenTopoMap',
  dark: '© CartoDB',
}

let currentTileLayer: L.TileLayer | null = null

function changeLayer(layerId: string) {
  if (!props.map) return

  activeLayer.value = layerId
  isOpen.value = false

  // Remover capa actual
  if (currentTileLayer) {
    props.map.removeLayer(currentTileLayer)
  }

  // Añadir nueva capa
  const tileUrl = tileLayers[layerId]
  const attribution = attributions[layerId]

  currentTileLayer = L.tileLayer(tileUrl, {
    attribution,
    maxZoom: 19,
  })

  currentTileLayer.addTo(props.map)
  
  emit('layer-change', layerId)
}

watch(() => props.map, (newMap) => {
  if (newMap && !currentTileLayer) {
    changeLayer('streets')
  }
}, { immediate: true })
</script>

<template>
  <div class="layer-control">
    <button 
      class="layer-toggle" 
      @click="isOpen = !isOpen"
      :class="{ active: isOpen }"
    >
      📚
    </button>

    <Transition name="slide">
      <div v-if="isOpen" class="layer-panel">
        <div class="layer-header">
          <h4>Capas del mapa</h4>
        </div>
        
        <div class="layer-list">
          <button
            v-for="layer in baseLayers"
            :key="layer.id"
            class="layer-item"
            :class="{ active: activeLayer === layer.id }"
            @click="changeLayer(layer.id)"
          >
            <span class="layer-icon">{{ layer.icon }}</span>
            <span class="layer-name">{{ layer.name }}</span>
            <span v-if="activeLayer === layer.id" class="check-mark">✓</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.layer-control {
  /* No absolute positioning - flows in flex container */
}

.layer-toggle {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  font-size: 20px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layer-toggle:hover {
  background: #f1f5f9;
  transform: scale(1.05);
}

.layer-toggle.active {
  background: #3b82f6;
  color: white;
}

.layer-panel {
  position: absolute;
  top: 52px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  min-width: 180px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  z-index: 2001;
}

.layer-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.layer-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.layer-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.layer-item:hover {
  background: #f1f5f9;
}

.layer-item.active {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.layer-icon {
  font-size: 18px;
}

.layer-name {
  flex: 1;
  font-size: 13px;
}

.check-mark {
  color: #10b981;
  font-weight: bold;
}

/* Transiciones */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
