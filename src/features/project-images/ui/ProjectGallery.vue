<script setup lang="ts">
import type { ProjectImage } from "~/shared/types";

defineProps<{
  images: ProjectImage[];
  isDeveloper: boolean;
}>();

const emit = defineEmits<{
  upload: [];
  open: [image: ProjectImage];
  delete: [imageId: number];
}>();
</script>

<template>
  <section class="glass-panel mt-4 space-y-3 p-4">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold">Галерея снимков</h2>
      <button v-if="isDeveloper" class="accent-button py-1.5" @click="emit('upload')">
        <Icon name="material-symbols:upload-rounded" class="h-4 w-4" />
        Загрузить снимок
      </button>
    </div>
    <div v-if="images.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="image in images"
        :key="image.id"
        class="rounded-xl border border-zinc-200/80 bg-white/70 p-2 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/70"
      >
        <img
          :src="image.fileUrl"
          :alt="image.fileName"
          class="h-44 w-full cursor-zoom-in rounded object-cover"
          @click="emit('open', image)"
        />
        <div class="mt-2 flex items-center justify-between gap-2">
          <p class="truncate text-xs text-zinc-500">{{ image.fileName }}</p>
          <button
            v-if="isDeveloper"
            class="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 px-2 py-1 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300"
            @click="emit('delete', image.id)"
          >
            <Icon name="material-symbols:delete-rounded" class="h-4 w-4" />
            Удалить
          </button>
        </div>
      </article>
    </div>
    <p v-else class="text-sm text-zinc-500">Снимков пока нет.</p>
  </section>
</template>

