import type { ClientWithProjects, User } from "~/shared/types";
import { useApi } from "~/shared/api";

const isClientWithProjects = (user: User & { projects?: ClientWithProjects["projects"] }): user is ClientWithProjects =>
  user.role === "CLIENT" && Array.isArray(user.projects);

export const useClientManagement = () => {
  const clients = ref<ClientWithProjects[]>([]);
  const loading = ref(false);
  const search = ref("");
  const expandedIds = ref<Set<number>>(new Set());
  const formError = ref("");
  const formSuccess = ref("");
  const actionError = ref("");

  const form = reactive({
    name: "",
    login: "",
    password: ""
  });

  const loadClients = async () => {
    loading.value = true;
    actionError.value = "";
    try {
      const users = await useApi<Array<User & { projects?: ClientWithProjects["projects"] }>>("/api/users");
      clients.value = users.filter(isClientWithProjects);
    } finally {
      loading.value = false;
    }
  };

  const filteredClients = computed(() => {
    const query = search.value.trim().toLowerCase();
    if (!query) return clients.value;

    return clients.value.filter((client) => {
      if (client.name.toLowerCase().includes(query)) return true;
      if (client.login.toLowerCase().includes(query)) return true;
      return client.projects.some((project) => project.title.toLowerCase().includes(query));
    });
  });

  const toggleExpanded = (clientId: number) => {
    const next = new Set(expandedIds.value);
    if (next.has(clientId)) next.delete(clientId);
    else next.add(clientId);
    expandedIds.value = next;
  };

  const isExpanded = (clientId: number) => expandedIds.value.has(clientId);

  const createClient = async () => {
    formError.value = "";
    formSuccess.value = "";
    try {
      await useApi<User>("/api/users", {
        method: "POST",
        body: {
          name: form.name.trim(),
          login: form.login.trim(),
          password: form.password
        }
      });
      form.name = "";
      form.login = "";
      form.password = "";
      formSuccess.value = "Клиент добавлен";
      await loadClients();
    } catch {
      formError.value = "Не удалось создать клиента (возможно, логин уже занят)";
    }
  };

  const deleteClient = async (client: ClientWithProjects) => {
    if (!import.meta.client) return;
    const confirmed = window.confirm(`Удалить клиента «${client.name}» (${client.login})?`);
    if (!confirmed) return;

    actionError.value = "";
    try {
      await useApi(`/api/users/${client.id}`, { method: "DELETE" });
      const next = new Set(expandedIds.value);
      next.delete(client.id);
      expandedIds.value = next;
      await loadClients();
    } catch {
      actionError.value = "Не удалось удалить клиента";
    }
  };

  onMounted(loadClients);

  return {
    clients,
    filteredClients,
    loading,
    search,
    form,
    formError,
    formSuccess,
    actionError,
    loadClients,
    createClient,
    deleteClient,
    toggleExpanded,
    isExpanded
  };
};
