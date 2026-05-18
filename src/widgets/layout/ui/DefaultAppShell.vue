<script setup lang="ts">
import { SessionSwitcher } from "~/features/session-switcher";
import { ThemeToggle } from "~/features/theme-toggle";

const menuOpen = ref(false);
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  }
);
</script>

<template>
  <div class="min-h-screen text-zinc-900 transition-colors dark:text-zinc-100">
    <header class="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/70 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/70">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:py-5">
        <NuxtLink
          to="/"
          class="inline-flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight md:text-2xl"
          @click="menuOpen = false"
        >
          <Icon name="material-symbols:dashboard-rounded" class="h-6 w-6 shrink-0 text-indigo-500 dark:text-sky-400" />
          <span class="truncate bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">
            Gogol Dashboard
          </span>
        </NuxtLink>

        <!-- Планшет и десктоп -->
        <div class="hidden items-center gap-2 md:flex">
          <SessionSwitcher />
          <ThemeToggle />
        </div>

        <!-- Телефон: меню -->
        <button
          type="button"
          class="soft-button inline-flex h-10 w-10 items-center justify-center md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="header-mobile-menu"
          aria-label="Меню"
          @click="menuOpen = !menuOpen"
        >
          <Icon
            :name="menuOpen ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'"
            class="h-6 w-6"
          />
        </button>
      </div>

      <div
        v-show="menuOpen"
        id="header-mobile-menu"
        class="border-t border-zinc-200/70 px-4 py-3 dark:border-zinc-800/70 md:hidden"
      >
        <div class="flex flex-col gap-3">
          <SessionSwitcher stacked />
          <ThemeToggle stacked />
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
