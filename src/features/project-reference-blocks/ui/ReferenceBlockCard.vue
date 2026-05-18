<script setup lang="ts">
import type { ProjectReferenceBlock } from "~/shared/types";

defineProps<{
  block: ProjectReferenceBlock;
}>();

const emit = defineEmits<{
  save: [];
  delete: [];
}>();
</script>

<template>
  <article class="rounded-xl border border-zinc-200/80 bg-white/60 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/50">
    <input v-model="block.title" type="text" class="soft-input mb-2 w-full text-sm font-medium" placeholder="Название" />
    <textarea
      v-model="block.content"
      class="soft-input mb-2 min-h-16 w-full resize-y text-sm"
      placeholder="Текст (например: +40% пользователей)"
    />
    <div class="flex flex-wrap gap-2">
      <button type="button" class="soft-button inline-flex items-center gap-1 py-1 text-xs" @click="emit('save')">
        <Icon name="material-symbols:save-rounded" class="h-4 w-4" />
        Сохранить
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 px-2 py-1 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300"
        @click="emit('delete')"
      >
        <Icon name="material-symbols:delete-rounded" class="h-4 w-4" />
        Удалить
      </button>
    </div>
  </article>
</template>
