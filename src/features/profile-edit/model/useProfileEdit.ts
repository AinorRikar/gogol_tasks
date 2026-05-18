import type { User } from "~/shared/types";
import { useApi, useCurrentUser } from "~/shared/api";

export const useProfileEdit = () => {
  const currentUser = useCurrentUser();
  const saving = ref(false);
  const error = ref("");
  const success = ref("");

  const form = reactive({
    name: "",
    login: "",
    password: ""
  });

  const syncForm = () => {
    if (!currentUser.value) return;
    form.name = currentUser.value.name;
    form.login = currentUser.value.login;
    form.password = "";
  };

  watch(currentUser, syncForm, { immediate: true });

  const save = async () => {
    if (!currentUser.value) return;

    saving.value = true;
    error.value = "";
    success.value = "";

    const body: Record<string, string> = {};
    const trimmedName = form.name.trim();
    const trimmedLogin = form.login.trim();

    if (trimmedName && trimmedName !== currentUser.value.name) {
      body.name = trimmedName;
    }
    if (trimmedLogin && trimmedLogin !== currentUser.value.login) {
      body.login = trimmedLogin;
    }
    if (form.password) {
      body.password = form.password;
    }

    if (!Object.keys(body).length) {
      saving.value = false;
      success.value = "Изменений нет";
      return;
    }

    try {
      currentUser.value = await useApi<User>("/api/users/me", {
        method: "PATCH",
        body
      });
      form.password = "";
      success.value = "Профиль обновлён";
    } catch {
      error.value = "Не удалось сохранить (возможно, логин уже занят)";
    } finally {
      saving.value = false;
    }
  };

  return { form, saving, error, success, save, syncForm };
};
