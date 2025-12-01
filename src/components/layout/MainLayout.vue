<template>
  <div class="main-layout">
    <Header />
    <div class="layout-content">
      <Sidebar />
      <main class="main-content-wrapper">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: #e5e5e5;
}

.layout-content {
  display: flex;
  min-height: calc(100vh - 120px);
}

.main-content-wrapper {
  flex: 1;
  margin-left: 240px;
  padding: 1.5rem;
  padding-top: 50px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .main-content-wrapper {
    margin-left: 200px;
    padding: 1rem;
    padding-top: 120px;
  }
}
</style>

