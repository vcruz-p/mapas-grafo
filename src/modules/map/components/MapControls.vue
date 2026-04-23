<script setup lang="ts">
defineProps<{
  routingEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'center'): void
  (e: 'reset'): void
  (e: 'clear-route'): void
  (e: 'update:routingEnabled', value: boolean): void
}>()
</script>

<template>
  <div class="map-controls">

    <button @click="emit('center')" class="control-btn" aria-label="Centrar marcador">
      📍
    </button>
    <button @click="emit('reset')" class="control-btn" aria-label="Resetear vista">
      ⟲
    </button>
    <button @click="emit('clear-route')" class="control-btn" aria-label="Limpiar ruta">
      🧹
    </button>

    <label class="toggle-control" aria-label="Activar rutas">
      <input
        type="checkbox"
        :checked="routingEnabled"
        @change="emit('update:routingEnabled', ($event.target as HTMLInputElement).checked)"
      />
      <span class="toggle-text">Rutas</span>
    </label>

  </div>
</template>

<style scoped>
.map-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-btn {
  width: 42px;
  height: 42px;
  border: none;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  font-size: 20px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: #f1f5f9;
  transform: scale(1.05);
}

.toggle-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 42px;
}

.toggle-control:hover {
  background: #f1f5f9;
}

.toggle-control input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.toggle-text {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}
</style>