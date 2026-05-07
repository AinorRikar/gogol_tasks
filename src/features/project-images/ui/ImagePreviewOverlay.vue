<script setup lang="ts">
import type { ProjectImage } from "~/shared/types/domain";

defineProps<{
  openedImage: ProjectImage | null;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div
    v-if="openedImage"
    class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <button
      class="absolute right-4 top-4 inline-flex items-center gap-1 rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
      @click="emit('close')"
    >
      <Icon name="material-symbols:close-rounded" class="h-4 w-4" />
      Закрыть
    </button>
    <img
      :src="openedImage.fileUrl"
      :alt="openedImage.fileName"
      class="max-h-[92vh] w-auto max-w-[96vw] rounded-xl object-contain shadow-2xl"
    />
  </div>
</template>

