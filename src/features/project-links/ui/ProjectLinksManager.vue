<script setup lang="ts">
import type { ProjectLink } from "~/shared/types";

const newUrl = defineModel<string>("newUrl", { required: true });

defineProps<{
  links: ProjectLink[];
  linkError: string;
  adding: boolean;
}>();

const emit = defineEmits<{
  add: [];
  delete: [linkId: number];
}>();
</script>

<template>
  <section class="mt-4 rounded-xl border border-dashed border-zinc-300/80 p-4 dark:border-zinc-700/80">
    <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Управление ссылками</h3>
    <form class="mt-3 flex flex-wrap items-end gap-2" @submit.prevent="emit('add')">
      <label class="min-w-0 flex-1">
        <span class="mb-1 block text-xs text-zinc-500">URL сайта</span>
        <input
          v-model="newUrl"
          type="url"
          class="soft-input w-full"
          placeholder="https://example.com"
          autocomplete="off"
        />
      </label>
      <button type="submit" class="accent-button inline-flex items-center gap-1" :disabled="adding">
        <Icon name="material-symbols:add-link-rounded" class="h-4 w-4" />
        {{ adding ? "Загрузка…" : "Добавить" }}
      </button>
    </form>
    <p v-if="linkError" class="mt-2 text-sm text-rose-500">{{ linkError }}</p>

    <ul v-if="links.length" class="mt-3 space-y-2">
      <li
        v-for="link in links"
        :key="link.id"
        class="flex items-center justify-between gap-2 rounded-lg border border-zinc-200/80 bg-white/60 px-2 py-1.5 text-sm dark:border-zinc-700/80 dark:bg-zinc-900/60"
      >
        <span class="truncate text-zinc-700 dark:text-zinc-300">{{ link.title }}</span>
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-300/80 px-2 py-1 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300"
          @click="emit('delete', link.id)"
        >
          <Icon name="material-symbols:delete-rounded" class="h-4 w-4" />
        </button>
      </li>
    </ul>
  </section>
</template>
