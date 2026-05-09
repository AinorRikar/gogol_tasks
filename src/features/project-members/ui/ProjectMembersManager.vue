<script setup lang="ts">
import type { ProjectListItem, User } from "~/shared/types";

defineProps<{
  project: ProjectListItem;
  availableClients: User[];
}>();

const emit = defineEmits<{
  close: [];
  add: [clientId: number];
  remove: [clientId: number];
}>();
</script>

<template>
  <section class="glass-panel p-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="font-semibold">Управление заказчиками проекта</h2>
      <button class="soft-button inline-flex items-center gap-1 py-1 text-xs" @click="emit('close')">
        <Icon name="material-symbols:close-rounded" class="h-4 w-4" />
        Закрыть
      </button>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <h3 class="mb-2 text-sm font-semibold">Назначенные</h3>
        <div class="space-y-2">
          <div
            v-for="member in project.members"
            :key="member.id"
            class="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/70 p-2 text-sm dark:border-zinc-700/80 dark:bg-zinc-900/70"
          >
            <span>{{ member.name }}</span>
            <button
              class="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 px-2 py-1 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300"
              @click="emit('remove', member.id)"
            >
              <Icon name="material-symbols:person-remove-rounded" class="h-4 w-4" />
              Удалить
            </button>
          </div>
          <p v-if="!project.members.length" class="text-xs text-zinc-500">Пока никто не назначен.</p>
        </div>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-semibold">Доступные заказчики</h3>
        <div class="space-y-2">
          <div
            v-for="client in availableClients"
            :key="client.id"
            class="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/70 p-2 text-sm dark:border-zinc-700/80 dark:bg-zinc-900/70"
          >
            <span>{{ client.name }}</span>
            <button class="soft-button inline-flex items-center gap-1 py-1 text-xs" @click="emit('add', client.id)">
              <Icon name="material-symbols:person-add-rounded" class="h-4 w-4" />
              Добавить
            </button>
          </div>
          <p v-if="!availableClients.length" class="text-xs text-zinc-500">Нет доступных заказчиков.</p>
        </div>
      </div>
    </div>
  </section>
</template>

