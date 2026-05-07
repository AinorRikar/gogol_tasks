import type { ProjectListItem, User } from "~/shared/types/domain";
import { useApi } from "~/shared/api/client";

export const useProjectMembers = (projectId: Ref<number>, project: Ref<ProjectListItem | null>) => {
  const users = ref<User[]>([]);
  const showMembersModal = ref(false);

  const loadUsers = async () => {
    users.value = await useApi<User[]>("/api/users");
  };

  const clients = computed(() => users.value.filter((user) => user.role === "CLIENT"));
  const assignedMemberIds = computed(() => new Set((project.value?.members ?? []).map((member) => member.id)));
  const availableClients = computed(() => clients.value.filter((client) => !assignedMemberIds.value.has(client.id)));

  const addClientToProject = async (clientId: number) => {
    await useApi(`/api/projects/${projectId.value}/members`, {
      method: "POST",
      body: { userId: clientId }
    });
  };

  const removeClientFromProject = async (clientId: number) => {
    await useApi(`/api/projects/${projectId.value}/members/${clientId}`, { method: "DELETE" });
  };

  return {
    users,
    showMembersModal,
    loadUsers,
    clients,
    availableClients,
    addClientToProject,
    removeClientFromProject
  };
};

