<script setup lang="ts">
import type { ProjectReferenceBlock } from "~/shared/types";
import ReferenceBlockCard from "./ReferenceBlockCard.vue";

defineProps<{
  blocks: ProjectReferenceBlock[];
  loading: boolean;
  error: string;
}>();

const newTitleModel = defineModel<string>("newTitle", { required: true });
const newContentModel = defineModel<string>("newContent", { required: true });

const emit = defineEmits<{
  create: [];
  save: [block: ProjectReferenceBlock];
  delete: [blockId: number];
}>();
</script>

<template>
  <section class="mt-4 rounded-xl border border-dashed border-indigo-300/60 p-4 dark:border-indigo-700/60">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Справочные блоки</h2>
      <span class="text-xs text-zinc-500">Только для разработчика</span>
    </div>

    <p v-if="error" class="mb-2 text-sm text-rose-500">{{ error }}</p>
    <p v-if="loading" class="mb-2 text-sm text-zinc-500">Загрузка…</p>

    <form class="mb-4 grid gap-2" @submit.prevent="emit('create')">
      <input v-model="newTitleModel" type="text" class="soft-input w-full text-sm" placeholder="Название блока" />
      <textarea
        v-model="newContentModel"
        class="soft-input min-h-16 w-full resize-y text-sm"
        placeholder="Текст метрики"
      />
      <button type="submit" class="accent-button inline-flex w-fit items-center gap-1 text-sm">
        <Icon name="material-symbols:add-rounded" class="h-4 w-4" />
        Добавить блок
      </button>
    </form>

    <div v-if="blocks.length" class="grid gap-3 sm:grid-cols-2">
      <ReferenceBlockCard
        v-for="block in blocks"
        :key="block.id"
        :block="block"
        @save="emit('save', block)"
        @delete="emit('delete', block.id)"
      />
    </div>
    <p v-else-if="!loading" class="text-sm text-zinc-500">Пока нет справочных блоков.</p>
  </section>
</template>
