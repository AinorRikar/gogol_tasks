<script setup lang="ts">
import type { ProjectListItem } from "~/shared/types";

defineProps<{
  editForm: {
    title: string;
    description: string;
    status: ProjectListItem["status"];
    visibility: boolean;
    hidden: boolean;
    useForPortfolio: boolean;
  };
}>();

const emit = defineEmits<{
  save: [];
}>();
</script>

<template>
  <form class="mt-3 grid gap-2" @submit.prevent="emit('save')">
    <input v-model="editForm.title" class="soft-input" />
    <textarea v-model="editForm.description" class="soft-input min-h-24" />
    <div class="flex gap-2">
      <select v-model="editForm.status" class="soft-input">
        <option value="ACTIVE">Активный</option>
        <option value="COMPLETED">Завершенный</option>
        <option value="ABANDONED">Заброшенный</option>
        <option value="SUPPORTED">Поддержка</option>
        <option value="PLANNING">Планируется</option>
      </select>
      <label class="glass-panel flex items-center gap-2 px-3 py-2 text-sm">
        <input v-model="editForm.visibility" type="checkbox" />
        Public
      </label>
      <label class="glass-panel flex items-center gap-2 px-3 py-2 text-sm">
        <input v-model="editForm.hidden" type="checkbox" />
        Hidden
      </label>
      <label class="glass-panel flex items-center gap-2 px-3 py-2 text-sm">
        <input v-model="editForm.useForPortfolio" type="checkbox" />
        Использовать для портфолио
      </label>
    </div>
    <button class="accent-button inline-flex w-fit items-center gap-1">
      <Icon name="material-symbols:save-rounded" class="h-4 w-4" />
      Сохранить
    </button>
  </form>
</template>

