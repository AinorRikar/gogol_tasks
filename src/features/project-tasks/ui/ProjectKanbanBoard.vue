<script setup lang="ts">
import type { ProjectTask, TaskStatus } from "~/shared/types";

defineProps<{
  canCreateTask: boolean;
  newTaskTitle: string;
  columnTasks: (status: TaskStatus) => ProjectTask[];
}>();

const emit = defineEmits<{
  create: [];
  move: [task: ProjectTask, status: TaskStatus];
  remove: [task: ProjectTask];
  "update:newTaskTitle": [value: string];
}>();
</script>

<template>
  <section class="glass-panel p-4">
    <h2 class="mb-3 font-semibold">Канбан задачи</h2>
    <div v-if="canCreateTask" class="mb-3 flex flex-wrap gap-2">
      <input
        :value="newTaskTitle"
        placeholder="Новая задача"
        class="soft-input min-w-52"
        @input="emit('update:newTaskTitle', ($event.target as HTMLInputElement).value)"
      />
      <button class="accent-button inline-flex items-center gap-1" @click="emit('create')">
        <Icon name="material-symbols:add-task-rounded" class="h-4 w-4" />
        Добавить
      </button>
    </div>
    <p v-else class="mb-3 text-sm text-zinc-500">
      Только назначенный заказчик или разработчик может добавлять задачи.
    </p>
    <div class="grid gap-3 md:grid-cols-3">
      <div
        v-for="col in ['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]"
        :key="col"
        class="rounded-2xl border border-zinc-200/80 bg-white/70 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/70"
      >
        <h3 class="mb-2 text-sm font-semibold">{{ col }}</h3>
        <div class="space-y-2">
          <div
            v-for="task in columnTasks(col)"
            :key="task.id"
            class="rounded-xl border border-zinc-200/80 bg-white/80 p-2 text-sm dark:border-zinc-700/80 dark:bg-zinc-900/80"
          >
            <p class="font-medium">{{ task.title }}</p>
            <p class="text-xs text-zinc-500">{{ task.assignee?.name || "Без исполнителя" }}</p>
            <div class="mt-2 flex flex-wrap gap-1">
              <button
                v-for="target in ['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]"
                :key="target"
                class="rounded-lg border border-zinc-300/80 px-1.5 py-0.5 text-xs dark:border-zinc-700/80"
                @click="emit('move', task, target)"
              >
                {{ target }}
              </button>
              <button
                class="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 px-1.5 py-0.5 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300"
                @click="emit('remove', task)"
              >
                <Icon name="material-symbols:delete-rounded" class="h-4 w-4" />
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

