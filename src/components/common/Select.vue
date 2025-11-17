<template>
    <div class="select-wrapper">
        <select :class="['select', { 'select-disabled': disabled }]" :value="modelValue" :disabled="disabled"
            @change="handleChange">
            <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">
interface Option {
    label: string
    value: string | number
}

interface Props {
    modelValue: string | number | null
    options: Option[]
    placeholder?: string
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string | number]
}>()

const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    emit('update:modelValue', target.value)
}
</script>

<style scoped>
.select-wrapper {
    position: relative;
}

.select {
    width: 100%;
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
    font-size: 1rem;
    color: #1f2937;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1.5em 1.5em;
    transition: all 0.2s;
}

.select:hover:not(:disabled) {
    border-color: #667eea;
}

.select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
