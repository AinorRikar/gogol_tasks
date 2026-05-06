<script setup lang="ts">
import type { ProjectStatus } from "~/shared/types/domain";
import { useApi } from "~/shared/api/client";

const emit = defineEmits<{ created: [] }>();

const form = reactive({
  title: "",
  description: "",
  status: "PLANNING" as ProjectStatus,
  visibility: true,
  hidden: false
});

const submit = async () => {
  await useApi("/api/projects", {
    method: "POST",
    body: form
  });
  form.title = "";
  form.description = "";
  form.status = "PLANNING";
  form.visibility = true;
  form.hidden = false;
  emit("created");
};
</script>

<template>
  <form class="glass-panel grid gap-3 p-5" @submit.prevent="submit">
    <h2 class="inline-flex items-center gap-2 text-base font-semibold">
      <Icon name="material-symbols:add-circle-rounded" class="h-5 w-5 text-indigo-500 dark:text-sky-400" />
      Создать проект (только разработчик)
    </h2>
    <input
      v-model="form.title"
      required
      class="soft-input"
      placeholder="Название"
    />
    <textarea
      v-model="form.description"
      required
      class="soft-input min-h-24"
      placeholder="Описание"
    />
    <div class="flex gap-2">
      <select v-model="form.status" class="soft-input">
        <option value="ACTIVE">Активный</option>
        <option value="COMPLETED">Завершенный</option>
        <option value="ABANDONED">Заброшенный</option>
        <option value="SUPPORTED">Поддерживаемый</option>
        <option value="PLANNING">Планирующийся</option>
      </select>
      <label class="glass-panel flex items-center gap-2 px-3 py-2 text-sm">
        <input v-model="form.visibility" type="checkbox" />
        Public
      </label>
      <label class="glass-panel flex items-center gap-2 px-3 py-2 text-sm">
        <input v-model="form.hidden" type="checkbox" />
        Hidden
      </label>
    </div>
    <p class="text-xs text-zinc-500">Заказчики назначаются позже в окне управления участниками проекта.</p>
    <button class="accent-button inline-flex w-fit items-center gap-1">
      <Icon name="material-symbols:check-circle-rounded" class="h-4 w-4" />
      Создать
    </button>
  </form>
</template>
