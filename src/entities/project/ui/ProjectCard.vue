<script setup lang="ts">
import type { ProjectListItem } from "~/shared/types/domain";

defineProps<{ project: ProjectListItem }>();

const statusLabels: Record<ProjectListItem["status"], string> = {
  ACTIVE: "Активный",
  COMPLETED: "Завершенный",
  ABANDONED: "Заброшенный",
  SUPPORTED: "Поддержка",
  PLANNING: "Планируется"
};
</script>

<template>
  <article class="glass-panel flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10">
    <div class="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold">{{ project.title }}</h3>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ statusLabels[project.status] }}</p>
      </div>
      <span
        class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
        :class="
          project.visibility
            ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
            : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
        "
      >
        <Icon :name="project.visibility ? 'material-symbols:language' : 'material-symbols:lock'" class="h-4 w-4" />
        {{ project.visibility ? "Public" : "Private" }}
      </span>
    </div>
    <p v-if="project.archivedAt" class="mb-2 text-xs text-amber-600 dark:text-amber-400">Архивирован</p>
    <p class="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
      {{ project.description || "Описание скрыто для приватного проекта." }}
    </p>
    <div class="mt-auto">
      <NuxtLink
        v-if="project.canOpen"
        :to="`/projects/${project.id}`"
        class="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20"
      >
        <Icon name="material-symbols:folder-open-rounded" class="h-4 w-4" />
        Открыть проект
      </NuxtLink>
      <p v-else class="text-sm text-zinc-500">Доступ к проекту ограничен</p>
    </div>
  </article>
</template>
