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
</script>

<style scoped>
.header {
  background: #000000;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 2rem;
  border-bottom-right-radius: 2rem;
  position: relative;
  z-index: 20;
}

.header-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
