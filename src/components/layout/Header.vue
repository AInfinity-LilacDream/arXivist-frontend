<template>
  <header class="header">
    <div class="header-container">
      <div class="header-logo">
        <h1>arXivist</h1>
        <p class="header-subtitle">AI驱动的论文发现平台</p>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Header组件
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-logo h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.9375rem;
  opacity: 0.9;
  font-weight: 400;
}
</style>
