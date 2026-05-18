<script setup lang="ts">
export type DeveloperCabinetSection = "profile" | "clients" | "analytics";

const model = defineModel<DeveloperCabinetSection>({ required: true });

const items: Array<{ id: DeveloperCabinetSection; label: string; icon: string }> = [
  { id: "profile", label: "Мои данные", icon: "material-symbols:person-rounded" },
  { id: "clients", label: "Управление заказчиками", icon: "material-symbols:groups-rounded" },
  { id: "analytics", label: "Аналитика", icon: "material-symbols:analytics-rounded" }
];
</script>

<template>
  <nav class="glass-panel p-2" aria-label="Разделы кабинета">
    <ul class="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
      <li v-for="item in items" :key="item.id" class="min-w-0 flex-1 sm:flex-initial">
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition"
          :class="
            model === item.id
              ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/25'
              : 'text-zinc-600 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80'
          "
          :aria-current="model === item.id ? 'page' : undefined"
          @click="model = item.id"
        >
          <Icon :name="item.icon" class="h-5 w-5 shrink-0" />
          <span class="truncate">{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
