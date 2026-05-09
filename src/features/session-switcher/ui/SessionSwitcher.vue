<script setup lang="ts">
import type { User, UserRole } from "~/shared/types";
import { useApi, useCurrentUser } from "~/shared/api";

const currentUser = useCurrentUser();
const mode = ref<"login" | "register">("login");
const loginForm = reactive({
  email: "",
  password: ""
});
const registerForm = reactive({
  name: "",
  email: "",
  password: "",
  role: "CLIENT" as UserRole
});
const error = ref("");
const success = ref("");

const login = async () => {
  try {
    error.value = "";
    success.value = "";
    currentUser.value = await useApi<User>("/api/auth/login", {
      method: "POST",
      body: {
        email: loginForm.email,
        password: loginForm.password
      }
    });
  } catch {
    error.value = "Неверные логин или пароль";
  }
};

const register = async () => {
  try {
    error.value = "";
    success.value = "";
    currentUser.value = await useApi<User>("/api/auth/register", {
      method: "POST",
      body: registerForm
    });
    success.value = "Регистрация успешна";
  } catch {
    error.value = "Не удалось зарегистрироваться (возможно, email уже занят)";
  }
};

const logout = async () => {
  await useApi("/api/auth/logout", { method: "POST" });
  currentUser.value = null;
};
</script>

<template>
  <div class="glass-panel flex items-center gap-2 px-3 py-2">
    <template v-if="currentUser">
      <span class="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
        <Icon name="material-symbols:account-circle-rounded" class="h-4 w-4" />
        {{ currentUser.name }} ({{ currentUser.role }})
      </span>
      <NuxtLink
        to="/cabinet"
        class="soft-button inline-flex items-center gap-1 py-1"
        title="Личный кабинет"
        aria-label="Личный кабинет"
      >
        <Icon name="material-symbols:manage-accounts-rounded" class="h-4 w-4" aria-hidden="true" />
        <span class="sr-only">Личный кабинет</span>
      </NuxtLink>
      <button class="soft-button inline-flex items-center gap-1 py-1" @click="logout">
        <Icon name="material-symbols:logout-rounded" class="h-4 w-4" />
        Выйти
      </button>
    </template>
    <template v-else>
      <div class="flex items-center gap-1 rounded-xl border border-zinc-300/80 bg-white/70 p-1 dark:border-zinc-700/80 dark:bg-zinc-900/70">
        <button
          class="rounded-lg px-2 py-1 text-xs transition"
          :class="mode === 'login' ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow' : 'text-zinc-600 dark:text-zinc-300'"
          @click="mode = 'login'"
        >
          Вход
        </button>
        <button
          class="rounded-lg px-2 py-1 text-xs transition"
          :class="mode === 'register' ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow' : 'text-zinc-600 dark:text-zinc-300'"
          @click="mode = 'register'"
        >
          Регистрация
        </button>
      </div>
      <template v-if="mode === 'login'">
        <input
          v-model="loginForm.email"
          type="email"
          placeholder="Email"
          class="soft-input w-40 py-1"
        />
        <input
          v-model="loginForm.password"
          type="password"
          placeholder="Пароль"
          class="soft-input w-28 py-1"
        />
        <button class="accent-button inline-flex items-center gap-1 py-1" @click="login">
          <Icon name="material-symbols:login-rounded" class="h-4 w-4" />
          Войти
        </button>
      </template>
      <template v-else>
        <input
          v-model="registerForm.name"
          type="text"
          placeholder="Имя"
          class="soft-input w-28 py-1"
        />
        <input
          v-model="registerForm.email"
          type="email"
          placeholder="Email"
          class="soft-input w-40 py-1"
        />
        <input
          v-model="registerForm.password"
          type="password"
          placeholder="Пароль"
          class="soft-input w-28 py-1"
        />
        <select v-model="registerForm.role" class="soft-input py-1">
          <option value="CLIENT">CLIENT</option>
          <option value="DEVELOPER">DEVELOPER</option>
        </select>
        <button class="accent-button inline-flex items-center gap-1 py-1" @click="register">
          <Icon name="material-symbols:person-add-rounded" class="h-4 w-4" />
          Создать аккаунт
        </button>
      </template>
      <span v-if="error" class="text-xs text-rose-500">{{ error }}</span>
      <span v-else-if="success" class="text-xs text-emerald-600">{{ success }}</span>
    </template>
  </div>
</template>
