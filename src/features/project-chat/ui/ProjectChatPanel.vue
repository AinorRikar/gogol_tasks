<script setup lang="ts">
import type { ChatMessage } from "~/shared/types";
import { formatMessageDate } from "~/shared/lib";

defineProps<{
  messages: ChatMessage[];
  currentUserId: number | null;
  newMessage: string;
}>();

const emit = defineEmits<{
  send: [];
  "update:newMessage": [value: string];
}>();
</script>

<template>
  <section class="glass-panel flex h-[calc(100vh-16rem)] min-h-[540px] flex-col p-4">
    <h2 class="mb-3 font-semibold">Чат проекта</h2>
    <div class="flex-1 space-y-2 overflow-y-auto pr-1">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.author.id === currentUserId ? 'justify-start' : 'justify-end'"
      >
        <article
          class="max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm"
          :class="
            message.author.id === currentUserId
              ? 'border border-sky-200/80 bg-sky-50/80 text-zinc-800 dark:border-sky-700/50 dark:bg-sky-900/25 dark:text-zinc-100'
              : 'border border-violet-200/80 bg-violet-50/80 text-zinc-800 dark:border-violet-700/50 dark:bg-violet-900/25 dark:text-zinc-100'
          "
        >
          <div class="mb-1 text-xs font-semibold text-zinc-500">
            {{ message.author.name }}
          </div>
          <p class="leading-relaxed">{{ message.text }}</p>
          <p v-if="message.sentAt" class="mt-1 text-[11px] text-zinc-400">
            {{ formatMessageDate(message.sentAt) }}
          </p>
        </article>
      </div>
    </div>
    <div class="mt-3 flex gap-2 border-t border-zinc-200/70 pt-3 dark:border-zinc-700/70">
      <input
        :value="newMessage"
        type="text"
        class="soft-input flex-1"
        placeholder="Введите сообщение"
        @input="emit('update:newMessage', ($event.target as HTMLInputElement).value)"
        @keydown.enter.prevent="emit('send')"
      />
      <button class="accent-button inline-flex shrink-0 items-center gap-1" @click="emit('send')">
        <Icon name="material-symbols:send-rounded" class="h-4 w-4" />
        Отправить
      </button>
    </div>
  </section>
</template>

