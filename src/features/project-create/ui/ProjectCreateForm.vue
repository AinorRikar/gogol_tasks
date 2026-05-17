<script setup lang="ts">
import { TechStackEditor } from "~/features/project-edit";
import { ProjectFlagsFields } from "~/entities/project";
import type { ProjectStatus } from "~/shared/types";
import { useApi } from "~/shared/api";

const emit = defineEmits<{ created: [] }>();

const techStackEditorRef = ref<{ flushPending: () => void } | null>(null);

const form = reactive({
  title: "",
  shortDescription: "",
  fullDescription: "",
  version: "",
  status: "PLANNING" as ProjectStatus,
  visibility: true,
  hidden: false,
  useForPortfolio: false,
  techStack: ""
});

const submit = async () => {
  techStackEditorRef.value?.flushPending();
  await useApi("/api/projects", {
    method: "POST",
    body: form
  });
  form.title = "";
  form.shortDescription = "";
  form.fullDescription = "";
  form.version = "";
  form.status = "PLANNING";
  form.visibility = true;
  form.hidden = false;
  form.useForPortfolio = false;
  form.techStack = "";
  emit("created");
};
</script>

<template>
  <form class="glass-panel grid w-full min-w-0 max-w-full gap-3 overflow-hidden p-4 sm:p-5" @submit.prevent="submit">
    <h2 class="inline-flex min-w-0 items-center gap-2 text-base font-semibold">
      <Icon name="material-symbols:add-circle-rounded" class="h-5 w-5 shrink-0 text-indigo-500 dark:text-sky-400" />
      <span class="min-w-0">Создать проект (только разработчик)</span>
    </h2>

    <input v-model="form.title" required class="soft-input w-full min-w-0" placeholder="Название" />
    <input v-model="form.version" class="soft-input w-full min-w-0" placeholder="Версия (например 1.0.0)" />
    <textarea
      v-model="form.shortDescription"
      required
      class="soft-input min-h-20 w-full min-w-0 resize-y"
      placeholder="Краткое описание (для карточки в списке)"
    />
    <textarea
      v-model="form.fullDescription"
      class="soft-input min-h-32 w-full min-w-0 resize-y"
      placeholder="Полное описание (на странице проекта)"
    />

    <div class="grid min-w-0 gap-2">
      <select v-model="form.status" class="soft-input w-full min-w-0">
        <option value="ACTIVE">Активный</option>
        <option value="COMPLETED">Завершенный</option>
        <option value="ABANDONED">Заброшенный</option>
        <option value="SUPPORTED">Поддерживаемый</option>
        <option value="PLANNING">Планирующийся</option>
      </select>

      <ProjectFlagsFields
        v-model:visibility="form.visibility"
        v-model:hidden="form.hidden"
        v-model:use-for-portfolio="form.useForPortfolio"
      />
    </div>

    <div class="min-w-0">
      <TechStackEditor ref="techStackEditorRef" v-model="form.techStack" />
    </div>

    <p class="min-w-0 text-xs text-zinc-500">Заказчики назначаются позже в окне управления участниками проекта.</p>
    <button type="submit" class="accent-button inline-flex w-full items-center justify-center gap-1 sm:w-fit">
      <Icon name="material-symbols:check-circle-rounded" class="h-4 w-4" />
      Создать
    </button>
  </form>
</template>
