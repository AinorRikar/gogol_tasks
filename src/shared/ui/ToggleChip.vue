<script setup lang="ts">
const model = defineModel<boolean>({ required: true });

defineProps<{
  label: string;
  icon: string;
}>();
</script>

<template>
  <label class="toggle-chip" :class="model ? 'toggle-chip--active' : ''">
    <input v-model="model" type="checkbox" class="sr-only" />
    <Icon :name="icon" class="h-3.5 w-3.5 shrink-0 opacity-80" />
    <span>{{ label }}</span>
  </label>
</template>
