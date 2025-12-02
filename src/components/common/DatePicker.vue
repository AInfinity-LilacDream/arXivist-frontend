<template>
  <div class="date-picker" ref="datePickerRef">
    <div class="date-display" @click="toggleCalendar">
      <span class="date-text">{{ displayDate }}</span>
      <span class="date-icon">📅</span>
    </div>
    <div v-if="showCalendar" class="calendar-wrapper">
      <Calendar
        :model-value="modelValue"
        :max-date="maxDate"
        @update:model-value="handleDateChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { formatDateInput } from '@/utils/format'
import Calendar from './Calendar.vue'

interface Props {
  modelValue: string
  maxDate?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxDate: undefined
})

const emit = defineEmits<Emits>()

const datePickerRef = ref<HTMLElement | null>(null)
const showCalendar = ref(false)

const displayDate = computed(() => {
  if (!props.modelValue) return '选择日期'
  const date = new Date(props.modelValue)
  if (isNaN(date.getTime())) return '选择日期'
  return formatDateInput(date)
})

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
}

const handleDateChange = (value: string) => {
  emit('update:modelValue', value)
  showCalendar.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (datePickerRef.value && !datePickerRef.value.contains(event.target as Node)) {
    showCalendar.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.date-picker {
  position: relative;
  width: 100%;
}

.date-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border: none;
  border-bottom: 1px solid #666666;
  border-radius: 0;
  background: transparent;
  color: #ffffff;
  font-size: 0.875rem;
  width: 100%;
  min-width: 180px;
  cursor: pointer;
  transition: border-bottom 0.2s ease;
  font-family: inherit;
}

.date-display:hover {
  border-bottom-color: #888888;
}

.date-display:active {
  border-bottom: 2px solid #ffffff;
}

.date-text {
  color: #ffffff;
  flex: 1;
}

.date-icon {
  font-size: 1rem;
  opacity: 0.8;
  margin-left: 0.5rem;
  user-select: none;
}

.date-display:hover .date-icon {
  opacity: 1;
}

.calendar-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  z-index: 1000;
}
</style>

