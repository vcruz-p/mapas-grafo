<script setup lang="ts">
import Dashboard from './views/Dashboard.vue'
</script>

<template>
  <div id="app">
    <Dashboard />
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: #f8fafc;
  color: #0f172a;
}

/* Mejora base de render */
* {
  box-sizing: border-box;
}
</style>