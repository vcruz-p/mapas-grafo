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
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.map-controls button {
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

.map-controls button:hover {
  background: #f1f5f9;
  transform: scale(1.05);
}

.toggle {
  font-size: 13px;
  background: white;
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle:hover {
  background: #f1f5f9;
}
</style>