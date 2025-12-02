<template>
  <div class="calendar">
    <!-- 头部：年月选择和导航 -->
    <div class="calendar-header">
      <button class="calendar-nav-btn" @click="previousMonth" type="button">
        <span>‹</span>
      </button>
      <div class="calendar-month-year">
        <button class="calendar-month-btn" @click="toggleMonthPicker" type="button">
          {{ currentYear }}年{{ currentMonth + 1 }}月
        </button>
      </div>
      <button class="calendar-nav-btn" @click="nextMonth" type="button">
        <span>›</span>
      </button>
    </div>

    <!-- 月份选择器 -->
    <div v-if="showMonthPicker" class="calendar-month-picker">
      <div class="month-picker-header">
        <button class="month-picker-nav" @click="previousYear" type="button">‹</button>
        <span class="month-picker-year">{{ currentYear }}</span>
        <button class="month-picker-nav" @click="nextYear" type="button">›</button>
      </div>
      <div class="month-picker-grid">
        <button
          v-for="month in 12"
          :key="month"
          class="month-picker-item"
          :class="{ 'month-picker-item-selected': month - 1 === currentMonth && !showYearPicker }"
          @click="selectMonth(month - 1)"
          type="button"
        >
          {{ month }}月
        </button>
      </div>
    </div>

    <!-- 星期标题 -->
    <div class="calendar-weekdays">
      <div v-for="day in weekdays" :key="day" class="calendar-weekday">
        {{ day }}
      </div>
    </div>

    <!-- 日期网格 -->
    <div class="calendar-days">
      <button
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'calendar-day-other-month': day.otherMonth,
          'calendar-day-today': day.isToday,
          'calendar-day-selected': day.isSelected,
          'calendar-day-disabled': day.disabled
        }"
        :disabled="day.disabled"
        @click="selectDate(day.date)"
        type="button"
      >
        {{ day.day }}
      </button>
    </div>

    <!-- 底部按钮 -->
    <div class="calendar-footer">
      <button class="calendar-footer-btn" @click="selectToday" type="button">
        今天
      </button>
      <button class="calendar-footer-btn" @click="clearDate" type="button">
        清除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatDateInput } from '@/utils/format'

interface Props {
  modelValue: string
  maxDate?: string
  minDate?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxDate: undefined,
  minDate: undefined
})

const emit = defineEmits<Emits>()

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const currentDate = ref(new Date())
const showMonthPicker = ref(false)
const showYearPicker = ref(false)

// 从 modelValue 初始化当前日期
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const date = new Date(newValue)
      if (!isNaN(date.getTime())) {
        currentDate.value = date
      }
    }
  },
  { immediate: true }
)

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

// 计算日历天数
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDay = (firstDay.getDay() + 6) % 7 // 转换为周一开始（0=周一）

  const days: Array<{
    day: number
    date: Date
    otherMonth: boolean
    isToday: boolean
    isSelected: boolean
    disabled: boolean
  }> = []

  // 上个月的日期
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({
      day: prevMonthLastDay - i,
      date,
      otherMonth: true,
      isToday: isToday(date),
      isSelected: isSelected(date),
      disabled: isDisabled(date)
    })
  }

  // 当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push({
      day,
      date,
      otherMonth: false,
      isToday: isToday(date),
      isSelected: isSelected(date),
      disabled: isDisabled(date)
    })
  }

  // 下个月的日期（填充到42天，6周）
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      day,
      date,
      otherMonth: true,
      isToday: isToday(date),
      isSelected: isSelected(date),
      disabled: isDisabled(date)
    })
  }

  return days
})

const isToday = (date: Date): boolean => {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

const isSelected = (date: Date): boolean => {
  if (!props.modelValue) return false
  const selected = new Date(props.modelValue)
  return (
    date.getFullYear() === selected.getFullYear() &&
    date.getMonth() === selected.getMonth() &&
    date.getDate() === selected.getDate()
  )
}

const isDisabled = (date: Date): boolean => {
  if (props.maxDate) {
    const max = new Date(props.maxDate)
    max.setHours(23, 59, 59, 999)
    if (date > max) return true
  }
  if (props.minDate) {
    const min = new Date(props.minDate)
    min.setHours(0, 0, 0, 0)
    if (date < min) return true
  }
  return false
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const previousYear = () => {
  currentDate.value = new Date(currentYear.value - 1, currentMonth.value, 1)
}

const nextYear = () => {
  currentDate.value = new Date(currentYear.value + 1, currentMonth.value, 1)
}

const toggleMonthPicker = () => {
  showMonthPicker.value = !showMonthPicker.value
  showYearPicker.value = false
}

const selectMonth = (month: number) => {
  currentDate.value = new Date(currentYear.value, month, 1)
  showMonthPicker.value = false
}

const selectDate = (date: Date) => {
  if (isDisabled(date)) return
  emit('update:modelValue', formatDateInput(date))
}

const selectToday = () => {
  const today = new Date()
  if (!isDisabled(today)) {
    emit('update:modelValue', formatDateInput(today))
  }
}

const clearDate = () => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.calendar {
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 0.5rem;
  padding: 1rem;
  min-width: 280px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.calendar-nav-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background 0.2s;
  padding: 0;
}

.calendar-nav-btn:hover {
  background: #252525;
}

.calendar-month-year {
  flex: 1;
  display: flex;
  justify-content: center;
}

.calendar-month-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.calendar-month-btn:hover {
  background: #252525;
}

.calendar-month-picker {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #252525;
  border-radius: 0.5rem;
}

.month-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.month-picker-nav {
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1.25rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background 0.2s;
  padding: 0;
}

.month-picker-nav:hover {
  background: #333333;
}

.month-picker-year {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
}

.month-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.month-picker-item {
  background: transparent;
  border: 1px solid #333333;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.month-picker-item:hover {
  background: #333333;
  border-color: #555555;
}

.month-picker-item-selected {
  background: #ffffff;
  color: #000000;
  border-color: #ffffff;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.calendar-weekday {
  color: #a0a0a0;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  padding: 0.5rem 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.calendar-day {
  background: transparent;
  border: 1px solid transparent;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day:hover:not(:disabled) {
  background: #252525;
  border-color: #555555;
}

.calendar-day-other-month {
  color: #666666;
}

.calendar-day-today {
  border-color: #ffffff;
  font-weight: 600;
}

.calendar-day-selected {
  background: #ffffff;
  color: #000000;
  border-color: #ffffff;
  font-weight: 600;
}

.calendar-day-selected:hover:not(:disabled) {
  background: #f0f0f0;
}

.calendar-day-disabled {
  color: #444444;
  cursor: not-allowed;
  opacity: 0.5;
}

.calendar-day-disabled:hover {
  background: transparent;
  border-color: transparent;
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #333333;
}

.calendar-footer-btn {
  flex: 1;
  background: transparent;
  border: 1px solid #333333;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.calendar-footer-btn:hover {
  background: #252525;
  border-color: #555555;
}
</style>

