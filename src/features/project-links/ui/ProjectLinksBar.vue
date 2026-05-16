<script setup lang="ts">
import type { ProjectLink } from "~/shared/types";

defineProps<{
  links: ProjectLink[];
}>();
</script>

<template>
  <div v-if="links.length" class="mt-4">
    <p class="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Ссылки</p>
    <div class="flex flex-wrap gap-2">
      <a
        v-for="link in links"
        :key="link.id"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="soft-button inline-flex max-w-full items-center gap-2 py-2"
      >
        <img
          :src="link.iconUrl"
          :alt="''"
          class="h-5 w-5 shrink-0 rounded object-contain"
          width="20"
          height="20"
          loading="lazy"
          @error="($event.target as HTMLImageElement).style.visibility = 'hidden'"
        />
        <span class="truncate">{{ link.title }}</span>
        <Icon name="material-symbols:open-in-new-rounded" class="h-4 w-4 shrink-0 text-zinc-400" />
      </a>
    </div>
  </div>
</template>
