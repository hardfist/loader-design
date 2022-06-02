<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + Vkkite" />
</template>

<style lang="less">
@width: 10px;
@height: @width + 10px;

#header {
  width: @width;
  height: @height;
}

:root {
  --color: red;
}

h2 {
  color: var(--color);
}

</style>
