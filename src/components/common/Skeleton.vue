<template>
  <div class="skeleton" :class="[`skeleton-${variant}`, { 'skeleton-animated': animated }]" :style="style">
    <span v-if="text" class="skeleton-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular'
  animated?: boolean
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  variant: 'rectangular',
  animated: true
})

const style = computed(() => {
  const styles: Record<string, string> = {}
  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return styles
})
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
}

.skeleton-animated {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-text {
  display: inline-block;
  color: transparent;
  user-select: none;
}

.skeleton-circular {
  border-radius: 50%;
}

.skeleton-rectangular {
  border-radius: 0.25rem;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

