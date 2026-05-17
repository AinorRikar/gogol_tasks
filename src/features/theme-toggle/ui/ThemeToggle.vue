<script setup lang="ts">
import { computed } from "vue";
import { useColorMode } from "#imports";

const props = withDefaults(
  defineProps<{
    stacked?: boolean;
  }>(),
  { stacked: false }
);

const colorMode = useColorMode();
const isDark = computed({
  get: () => colorMode.value === "dark",
  set: (value: boolean) => {
    colorMode.preference = value ? "dark" : "light";
  }
});
</script>

<template>
  <label
    class="glass-panel flex cursor-pointer items-center gap-2 px-3 py-2 text-sm"
    :class="stacked ? 'w-full justify-between' : ''"
  >
    <span class="text-zinc-600 dark:text-zinc-300">
      {{ isDark ? "Темная тема" : "Светлая тема" }}
    </span>
    <input v-model="isDark" type="checkbox" class="sr-only" />
    <span
      class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition"
      :class="isDark ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'"
      aria-hidden="true"
    >
      <span
        class="absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition"
        :class="isDark ? 'left-5' : 'left-0.5'"
      >
        <Icon
          :name="isDark ? 'material-symbols:dark-mode-rounded' : 'material-symbols:light-mode-rounded'"
          class="h-3.5 w-3.5 text-amber-500 dark:text-indigo-400"
        />
      </span>
    </span>
  </label>
</template>
