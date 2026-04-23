<script setup lang="ts">
const props = defineProps<{
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


    <button @click="emit('center')">📍</button>
    <button @click="emit('reset')">⟲</button>
    <button @click="emit('clear-route')">🧹</button>

    <label class="toggle">
      <input
        type="checkbox"
        :checked="routingEnabled"
        @change="emit('update:routingEnabled', ($event.target as HTMLInputElement).checked)"
      />
      Rutas
    </label>

  </div>
</template>

<style scoped>
.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.map-controls button {
  width: 34px;
  height: 34px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.toggle {
  font-size: 12px;
  background: white;
  padding: 6px;
  border-radius: 6px;
}
</style>