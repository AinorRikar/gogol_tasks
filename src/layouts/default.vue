<script setup lang="ts">
import { useInitActiveUser } from "~/shared/api/client";

await useInitActiveUser();
</script>

<template>
  <div class="min-h-screen text-zinc-900 transition-colors dark:text-zinc-100">
    <header class="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/70 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/70">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-5 md:py-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-lg font-semibold tracking-tight md:text-2xl">
          <Icon name="material-symbols:dashboard-rounded" class="h-6 w-6 text-indigo-500 dark:text-sky-400" />
          <span class="bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">Gogol CRM Tasks</span>
        </NuxtLink>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <SessionSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
