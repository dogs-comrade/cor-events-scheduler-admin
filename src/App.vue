<template>
  <div id="app">
    <h1>Schedule Management</h1>
    <Home />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Home from './views/Home.vue';

export default defineComponent({
  name: 'App',
  components: {
    Home,
  },
});
</script>

<style>
@import './assets/styles/main.css';
</style>