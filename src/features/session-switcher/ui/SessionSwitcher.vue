<script setup lang="ts">
import type { User } from "~/shared/types";
import { useApi, useCurrentUser } from "~/shared/api";

const props = withDefaults(
  defineProps<{
    stacked?: boolean;
  }>(),
  { stacked: false }
);

const currentUser = useCurrentUser();
const loginForm = reactive({
  login: "",
  password: ""
});
const error = ref("");

const panelClass = computed(() =>
  props.stacked
    ? "glass-panel flex w-full flex-col gap-3 p-4"
    : "glass-panel flex flex-wrap items-center gap-2 px-3 py-2"
);

const rowClass = computed(() => (props.stacked ? "flex w-full flex-col gap-2" : "flex items-center gap-2"));

const login = async () => {
  try {
    error.value = "";
    currentUser.value = await useApi<User>("/api/auth/login", {
      method: "POST",
      body: {
        login: loginForm.login.trim(),
        password: loginForm.password
      }
    });
    loginForm.password = "";
  } catch {
    error.value = "Неверный логин или пароль";
  }
};

const logout = async () => {
  await useApi("/api/auth/logout", { method: "POST" });
  currentUser.value = null;
};
</script>

<template>
  <div :class="panelClass">
    <template v-if="currentUser">
      <div :class="rowClass">
        <span class="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
          <Icon name="material-symbols:account-circle-rounded" class="h-4 w-4 shrink-0" />
          {{ currentUser.name }}
          <span class="text-zinc-400">({{ currentUser.login }})</span>
        </span>
      </div>
      <div :class="rowClass">
        <NuxtLink
          to="/cabinet"
          class="soft-button inline-flex items-center justify-center gap-1 py-1"
          :class="stacked ? 'w-full' : ''"
        >
          <Icon name="material-symbols:manage-accounts-rounded" class="h-4 w-4" />
          Личный кабинет
        </NuxtLink>
        <button
          type="button"
          class="soft-button inline-flex items-center justify-center gap-1 py-1"
          :class="stacked ? 'w-full' : ''"
          @click="logout"
        >
          <Icon name="material-symbols:logout-rounded" class="h-4 w-4" />
          Выйти
        </button>
      </div>
    </template>
    <template v-else>
      <div :class="rowClass">
        <input
          v-model="loginForm.login"
          type="text"
          autocomplete="username"
          placeholder="Логин"
          class="soft-input py-1"
          :class="stacked ? 'w-full' : 'w-32'"
        />
        <input
          v-model="loginForm.password"
          type="password"
          autocomplete="current-password"
          placeholder="Пароль"
          class="soft-input py-1"
          :class="stacked ? 'w-full' : 'w-28'"
        />
        <button
          type="button"
          class="accent-button inline-flex items-center justify-center gap-1 py-1"
          :class="stacked ? 'w-full' : ''"
          @click="login"
        >
          <Icon name="material-symbols:login-rounded" class="h-4 w-4" />
          Войти
        </button>
      </div>
      <p v-if="error" class="w-full text-xs text-rose-500">{{ error }}</p>
    </template>
  </div>
</template>
