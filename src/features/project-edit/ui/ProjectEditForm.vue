<script setup lang="ts">
import { ProjectFlagsFields } from "~/entities/project";
import type { ProjectListItem } from "~/shared/types";

defineProps<{
  editForm: {
    title: string;
    shortDescription: string;
    fullDescription: string;
    version: string;
    status: ProjectListItem["status"];
    visibility: boolean;
    hidden: boolean;
    useForPortfolio: boolean;
    techStack: string;
  };
}>();

const emit = defineEmits<{
  save: [];
}>();
</script>

<template>
  <form class="mt-3 grid min-w-0 gap-2" @submit.prevent="emit('save')">
    <input v-model="editForm.title" class="soft-input w-full min-w-0" />
    <input v-model="editForm.version" class="soft-input w-full min-w-0" placeholder="Версия" />
    <textarea
      v-model="editForm.shortDescription"
      class="soft-input min-h-20 w-full min-w-0 resize-y"
      placeholder="Краткое описание"
    />
    <textarea
      v-model="editForm.fullDescription"
      class="soft-input min-h-32 w-full min-w-0 resize-y"
      placeholder="Полное описание"
    />
    <div class="grid min-w-0 gap-2">
      <select v-model="editForm.status" class="soft-input w-full min-w-0">
        <option value="ACTIVE">Активный</option>
        <option value="COMPLETED">Завершенный</option>
        <option value="ABANDONED">Заброшенный</option>
        <option value="SUPPORTED">Поддержка</option>
        <option value="PLANNING">Планируется</option>
      </select>
      <ProjectFlagsFields
        v-model:visibility="editForm.visibility"
        v-model:hidden="editForm.hidden"
        v-model:use-for-portfolio="editForm.useForPortfolio"
      />
    </div>
    <button type="submit" class="accent-button inline-flex w-full items-center justify-center gap-1 sm:w-fit">
      <Icon name="material-symbols:save-rounded" class="h-4 w-4" />
      Сохранить
    </button>
  </form>
</template>
