<template>
<!-- App.vue -->
  <v-app>
    <Home/>
  </v-app>
</template>

<script>
import Home from './views/Home.vue';

export default {
  name: 'App',

  components: {
    Home,
  },
};
</script>
