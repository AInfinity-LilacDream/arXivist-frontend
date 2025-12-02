<template>
  <div class="main-layout">
    <Header />
    <div class="layout-content">
      <Sidebar />
      <div class="main-content-area">
        <slot name="filter-bar" />
        <main class="main-content-wrapper">
          <slot />
        </main>
      </div>
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
  background: #2d2d2d;
}

.layout-content {
  display: flex;
  min-height: calc(100vh - 120px);
}

.main-content-area {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content-wrapper {
  flex: 1;
  padding: 1.5rem;
  padding-top: 50px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .main-content-area {
    margin-left: 200px;
  }
  
  .main-content-wrapper {
    padding: 1rem;
    padding-top: 120px;
  }
}
</style>

