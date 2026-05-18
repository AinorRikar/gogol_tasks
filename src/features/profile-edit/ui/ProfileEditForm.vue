<script setup lang="ts">
import { useProfileEdit } from "../model/useProfileEdit";

const { form, saving, error, success, save } = useProfileEdit();
</script>

<template>
  <section class="glass-panel p-6">
    <h2 class="text-lg font-medium text-zinc-900 dark:text-zinc-100">Мой профиль</h2>
    <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
      Измените имя, логин или пароль. Пустой пароль — пароль не меняется.
    </p>

    <form class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="save">
      <label class="block sm:col-span-2">
        <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Имя</span>
        <input v-model="form.name" type="text" required minlength="2" class="soft-input w-full" />
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Логин</span>
        <input
          v-model="form.login"
          type="text"
          required
          minlength="2"
          pattern="[a-zA-Z0-9_-]+"
          class="soft-input w-full"
          autocomplete="username"
        />
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Новый пароль</span>
        <input
          v-model="form.password"
          type="password"
          minlength="4"
          class="soft-input w-full"
          placeholder="Оставьте пустым, чтобы не менять"
          autocomplete="new-password"
        />
      </label>
      <div class="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" class="accent-button inline-flex items-center gap-2" :disabled="saving">
          <Icon name="material-symbols:save-rounded" class="h-4 w-4" />
          {{ saving ? "Сохранение…" : "Сохранить" }}
        </button>
        <p v-if="error" class="text-sm text-rose-500">{{ error }}</p>
        <p v-else-if="success" class="text-sm text-emerald-600">{{ success }}</p>
      </div>
    </form>
  </section>
</template>
