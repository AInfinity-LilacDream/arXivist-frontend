<template>
    <button :class="[
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        { 'btn-disabled': disabled, 'btn-loading': loading }
    ]" :disabled="disabled || loading" @click="handleClick">
        <span v-if="loading" class="btn-spinner"></span>
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
        emit('click', event)
    }
}
</script>

<style scoped>
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
}

.btn-md {
    padding: 0.5rem 1rem;
    font-size: 1rem;
}

.btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
    background: #6b7280;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #4b5563;
}

.btn-outline {
    background: transparent;
    border: 2px solid #667eea;
    color: #667eea;
}

.btn-outline:hover:not(:disabled) {
    background: #667eea;
    color: white;
}

.btn-ghost {
    background: transparent;
    color: #ffffff;
}

.btn-ghost:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
}

.btn-spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
