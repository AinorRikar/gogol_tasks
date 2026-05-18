<script setup lang="ts">
import type { ClientWithProjects } from "~/shared/types";

defineProps<{
  clients: ClientWithProjects[];
  loading: boolean;
  actionError: string;
  isExpanded: (clientId: number) => boolean;
}>();

const searchModel = defineModel<string>("search", { required: true });

const emit = defineEmits<{
  refresh: [];
  toggle: [clientId: number];
  delete: [client: ClientWithProjects];
}>();
</script>

<template>
  <section class="glass-panel p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-lg font-medium text-zinc-900 dark:text-zinc-100">Клиенты</h2>
      <div class="flex flex-wrap items-center gap-2">
        <label class="relative min-w-0 flex-1 sm:w-64">
          <span class="sr-only">Поиск</span>
          <Icon
            name="material-symbols:search-rounded"
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            v-model="searchModel"
            type="search"
            class="soft-input w-full py-2 pl-9"
            placeholder="Имя, логин или проект…"
          />
        </label>
        <button type="button" class="soft-button shrink-0 text-sm" :disabled="loading" @click="emit('refresh')">
          Обновить
        </button>
      </div>
    </div>

    <p v-if="actionError" class="mt-3 text-sm text-rose-500">{{ actionError }}</p>
    <p v-if="loading" class="mt-4 text-sm text-zinc-500">Загрузка…</p>

    <ul v-else-if="clients.length" class="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
      <li v-for="client in clients" :key="client.id" class="py-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            class="inline-flex min-w-0 flex-1 items-center gap-2 text-left"
            @click="emit('toggle', client.id)"
          >
            <Icon
              :name="isExpanded(client.id) ? 'material-symbols:expand-more-rounded' : 'material-symbols:chevron-right-rounded'"
              class="h-5 w-5 shrink-0 text-zinc-400"
            />
            <span class="truncate font-medium text-zinc-800 dark:text-zinc-200">{{ client.name }}</span>
            <span class="text-sm text-zinc-500">
              логин: <code class="text-indigo-600 dark:text-sky-400">{{ client.login }}</code>
            </span>
            <span v-if="client.projects.length" class="text-xs text-zinc-400">
              · {{ client.projects.length }}
              {{ client.projects.length === 1 ? "проект" : "проектов" }}
            </span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 px-2 py-1 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300"
            @click="emit('delete', client)"
          >
            <Icon name="material-symbols:delete-rounded" class="h-4 w-4" />
            Удалить
          </button>
        </div>

        <div v-if="isExpanded(client.id)" class="mt-3 ml-7 border-l border-zinc-200 pl-4 dark:border-zinc-700">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Проекты</p>
          <ul v-if="client.projects.length" class="space-y-1">
            <li v-for="project in client.projects" :key="project.id">
              <NuxtLink
                :to="`/projects/${project.id}`"
                class="text-sm text-indigo-600 hover:underline dark:text-sky-400"
              >
                {{ project.title }}
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="text-sm text-zinc-500">Нет связанных проектов.</p>
        </div>
      </li>
    </ul>

    <p v-else class="mt-4 text-sm text-zinc-500">
      {{ searchModel.trim() ? "Ничего не найдено." : "Пока нет клиентов." }}
    </p>
  </section>
</template>
