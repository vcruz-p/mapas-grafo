<script setup lang="ts">
const props = defineProps<{
  routingEnabled: boolean
  radioEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'center'): void
  (e: 'reset'): void
  (e: 'clear-route'): void
  (e: 'update:routingEnabled', v: boolean): void
  (e: 'update:radioEnabled', v: boolean): void
}>()

function toggleRouting() {
  emit('update:routingEnabled', !props.routingEnabled)
}

function toggleRadio() {
  emit('update:radioEnabled', !props.radioEnabled)
}
</script>

<template>
  <div class="map-controls">

    <!-- ZOOM -->
    <button class="control-btn" @click="emit('zoom-in')">
      <i class="bi bi-plus-lg"></i>
    </button>

    <button class="control-btn" @click="emit('zoom-out')">
      <i class="bi bi-dash-lg"></i>
    </button>

    <!-- CENTER -->
    <button class="control-btn" @click="emit('center')">
      <i class="bi bi-crosshair"></i>
    </button>

    <!-- RESET -->
    <button class="control-btn" @click="emit('reset')">
      <i class="bi bi-arrow-counterclockwise"></i>
    </button>

    <!-- CLEAR ROUTE -->
    <button class="control-btn" @click="emit('clear-route')">
      <i class="bi bi-trash3"></i>
    </button>

    <!-- ROUTING TOGGLE -->
    <button
      class="control-btn toggle"
      :class="{ active: routingEnabled }"
      @click="toggleRouting"
    >
      <i class="bi bi-sign-turn-right"></i>
    </button>

    <!-- RADIO TOGGLE -->
    <button
      class="control-btn toggle"
      :class="{ active: radioEnabled }"
      @click="toggleRadio"
    >
      <i class="bi bi-broadcast"></i>
    </button>

  </div>
</template>

<style scoped>
.map-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* botones base */
.control-btn {
  width: 42px;
  height: 42px;
  border: none;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);

  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

/* toggles activos */
.control-btn.toggle.active {
  background: #2563eb;
  color: white;
}

/* hover opcional */
.control-btn:hover {
  background: #f1f5f9;
}
</style>