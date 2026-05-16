<script setup lang="ts">
import type { DeveloperCabinetSection } from "./DeveloperCabinetNav.vue";
import DeveloperCabinetAnalytics from "./DeveloperCabinetAnalytics.vue";
import DeveloperCabinetClientsSection from "./DeveloperCabinetClientsSection.vue";
import DeveloperCabinetNav from "./DeveloperCabinetNav.vue";
import { ProfileEditForm } from "~/features/profile-edit";

const activeSection = ref<DeveloperCabinetSection>("profile");
</script>

<template>
  <div class="space-y-6">
    <div class="glass-panel p-6">
      <h1 class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Личный кабинет разработчика
      </h1>
      <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Профиль, заказчики и аналитика — выберите раздел в меню.
      </p>
    </div>

    <DeveloperCabinetNav v-model="activeSection" />

    <ProfileEditForm v-if="activeSection === 'profile'" />

    <DeveloperCabinetClientsSection v-else-if="activeSection === 'clients'" />

    <DeveloperCabinetAnalytics v-else />
  </div>
</template>
