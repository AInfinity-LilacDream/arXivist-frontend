<template>
    <div :class="['card', { 'card-hover': hover }]">
        <slot name="header"></slot>
        <div class="card-content">
            <slot></slot>
        </div>
        <slot name="footer"></slot>
    </div>
</template>

<script setup lang="ts">
interface Props {
    hover?: boolean
}

withDefaults(defineProps<Props>(), {
    hover: true
})
</script>

<style scoped>
.card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
}

.card-hover:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.card-content {
    padding: 1.5rem;
}
</style>
