<script setup lang="ts">
import { ProfileEditForm } from "~/features/profile-edit";
</script>

<template>
  <div class="space-y-6">
    <div class="glass-panel p-6">
      <h1 class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Личный кабинет заказчика
      </h1>
      <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Настройки вашего аккаунта.
      </p>
    </div>

    <ProfileEditForm />
  </div>
</template>
