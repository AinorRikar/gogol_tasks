<script setup lang="ts">
const props = defineProps<{
  form: { name: string; login: string; password: string };
  formError: string;
  formSuccess: string;
}>();

const emit = defineEmits<{
  submit: [];
}>();
</script>

<template>
  <section class="glass-panel p-6">
    <h2 class="text-lg font-medium text-zinc-900 dark:text-zinc-100">Новый клиент</h2>
    <form class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="emit('submit')">
      <label class="block sm:col-span-2">
        <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Имя</span>
        <input v-model="props.form.name" type="text" required minlength="2" class="soft-input w-full" placeholder="Иван Иванов" />
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Логин</span>
        <input
          v-model="props.form.login"
          type="text"
          required
          minlength="2"
          pattern="[a-zA-Z0-9_-]+"
          class="soft-input w-full"
          placeholder="ivan"
          autocomplete="off"
        />
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Пароль</span>
        <input
          v-model="props.form.password"
          type="password"
          required
          minlength="4"
          class="soft-input w-full"
          placeholder="••••••••"
          autocomplete="new-password"
        />
      </label>
      <div class="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" class="accent-button inline-flex items-center gap-2">
          <Icon name="material-symbols:person-add-rounded" class="h-4 w-4" />
          Добавить клиента
        </button>
        <p v-if="formError" class="text-sm text-rose-500">{{ formError }}</p>
        <p v-else-if="formSuccess" class="text-sm text-emerald-600">{{ formSuccess }}</p>
      </div>
    </form>
  </section>
</template>
