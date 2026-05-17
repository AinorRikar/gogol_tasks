<script setup lang="ts">
import { classesForTechTag } from "~/shared/lib";

const techStack = defineModel<string>({ default: "" });

const stackInput = ref("");

const items = computed(() =>
  techStack.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

const setItems = (next: string[]) => {
  techStack.value = next.join(",");
};

const commitToken = (raw: string) => {
  const t = raw.trim();
  if (!t) return;
  const next = items.value.slice();
  next.push(t);
  setItems(next);
};

const onStackKeydown = (e: KeyboardEvent) => {
  if (e.key !== ",") return;
  e.preventDefault();
  commitToken(stackInput.value);
  stackInput.value = "";
};

const onStackBlur = () => {
  if (stackInput.value.trim()) {
    commitToken(stackInput.value);
    stackInput.value = "";
  }
};

const removeAt = (index: number) => {
  setItems(items.value.filter((_, i) => i !== index));
};

/** Вызов перед сохранением формы: дописывает текст из поля без завершающей запятой. */
const flushPending = () => {
  if (stackInput.value.trim()) {
    commitToken(stackInput.value);
    stackInput.value = "";
  }
};

defineExpose({ flushPending });
</script>

<template>
  <div class="grid min-w-0 gap-2">
    <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Стек технологий</span>
    <div class="soft-input flex min-h-[2.5rem] w-full min-w-0 flex-wrap items-center gap-2 py-2">
      <span
        v-for="(tag, i) in items"
        :key="`${i}-${tag}`"
        class="inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-sm font-medium"
        :class="classesForTechTag(tag)"
      >
        {{ tag }}
        <button
          type="button"
          class="inline-flex rounded p-0.5 text-current/70 transition hover:bg-black/10 hover:text-current dark:hover:bg-white/15"
          :aria-label="`Удалить ${tag}`"
          @click="removeAt(i)"
        >
          <Icon name="material-symbols:close-rounded" class="h-4 w-4" />
        </button>
      </span>
      <input
        v-model="stackInput"
        type="text"
        class="min-w-0 flex-1 basis-20 border-0 bg-transparent py-0.5 text-sm outline-none focus:ring-0"
        placeholder="Введите технологию и запятую"
        autocomplete="off"
        @keydown="onStackKeydown"
        @blur="onStackBlur"
      />
    </div>
    <p class="text-xs text-zinc-500 dark:text-zinc-400">После запятой фрагмент превращается в отдельный тег.</p>
  </div>
</template>
