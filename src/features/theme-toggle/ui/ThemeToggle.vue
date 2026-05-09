<script setup lang="ts">
import { computed } from "vue";
import { useColorMode } from "#imports";

const colorMode = useColorMode();
const isDark = computed({
  get: () => colorMode.value === "dark",
  set: (value: boolean) => {
    colorMode.preference = value ? "dark" : "light";
  }
});
</script>

<template>
  <label class="glass-panel flex cursor-pointer items-center gap-2 px-3 py-2 text-sm">
    <Icon :name="isDark ? 'material-symbols:dark-mode-rounded' : 'material-symbols:light-mode-rounded'" class="h-4 w-4 text-zinc-500 dark:text-zinc-300" />
    <span class="text-zinc-600 dark:text-zinc-300">{{ isDark ? "Темная тема" : "Светлая тема" }}</span>
    <input v-model="isDark" type="checkbox" class="sr-only" />
  </label>
</template>
