<script setup lang="ts">
import { ProjectCard } from "~/entities/project";
import type { ProjectListItem, ProjectStatus } from "~/shared/types";
import { useApi } from "~/shared/api";
import { ToggleChip } from "~/shared/ui";

const projects = ref<ProjectListItem[]>([]);
const error = ref("");
const status = ref<ProjectStatus | "ALL">("ALL");
const visibility = ref<"ALL" | "PUBLIC" | "PRIVATE">("ALL");
const includeArchived = ref(false);
const portfolioOnly = ref(false);

const fetchProjects = async () => {
  const query = new URLSearchParams();
  if (status.value !== "ALL") query.set("status", status.value);
  if (visibility.value !== "ALL") query.set("visibility", visibility.value);
  if (includeArchived.value) query.set("includeArchived", "true");
  if (portfolioOnly.value) query.set("portfolioOnly", "true");
  try {
    error.value = "";
    projects.value = await useApi<ProjectListItem[]>(`/api/projects?${query.toString()}`);
  } catch {
    projects.value = [];
    error.value = "Не удалось загрузить проекты";
  }
};

watch([status, visibility, includeArchived, portfolioOnly], fetchProjects);
onMounted(fetchProjects);
</script>

<template>
  <section class="space-y-4">
    <div class="glass-panel flex flex-wrap gap-2 p-3">
      <select v-model="status" class="soft-input">
        <option value="ALL">Все статусы</option>
        <option value="ACTIVE">Активные</option>
        <option value="COMPLETED">Завершенные</option>
        <option value="ABANDONED">Заброшенные</option>
        <option value="SUPPORTED">Поддерживаемые</option>
        <option value="PLANNING">Планирующиеся</option>
      </select>
      <select v-model="visibility" class="soft-input">
        <option value="ALL">Все типы</option>
        <option value="PUBLIC">Публичные</option>
        <option value="PRIVATE">Приватные</option>
      </select>
      <ToggleChip
        v-model="portfolioOnly"
        label="В портфолио"
        icon="material-symbols:cases-rounded"
      />
      <ToggleChip
        v-model="includeArchived"
        label="Показывать архив"
        icon="material-symbols:archive-rounded"
      />
    </div>
    <p v-if="error" class="glass-panel px-3 py-2 text-sm text-amber-600 dark:text-amber-400">{{ error }}</p>
    <div class="grid gap-4 md:grid-cols-2">
      <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </section>
</template>
