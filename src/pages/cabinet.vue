<script setup lang="ts">
import { ClientCabinet, DeveloperCabinet } from "~/features/personal-cabinet";
import { useCurrentUser } from "~/shared/api";

const currentUser = useCurrentUser();
</script>

<template>
  <div class="space-y-6">
    <div v-if="!currentUser" class="glass-panel p-6">
      <p class="text-zinc-700 dark:text-zinc-300">
        Войдите в аккаунт, чтобы открыть личный кабинет.
      </p>
    </div>
    <ClientCabinet v-else-if="currentUser.role === 'CLIENT'" />
    <DeveloperCabinet v-else />
  </div>
</template>
