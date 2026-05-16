<script setup lang="ts">
import { useProject, useProjectId, useProjectMembers } from "~/entities/project";
import { useProjectChat } from "~/features/project-chat";
import { useProjectImages } from "~/features/project-images";
import { useProjectLinks } from "~/features/project-links";
import { useProjectTasks } from "~/features/project-tasks";
import { ProjectDetailsPage } from "~/widgets/project-details";
import { useCurrentUser } from "~/shared/api";

const currentUser = useCurrentUser();
const projectId = useProjectId();

const activeTab = ref<"overview" | "kanban" | "chat">("overview");

const { project, error, showEdit, editForm, loadProject, saveProject, archiveProject } = useProject(projectId);
const {
  showMembersModal,
  loadUsers,
  availableClients,
  addClientToProject,
  removeClientFromProject
} = useProjectMembers(projectId, project);

const isDeveloper = computed(() => currentUser.value?.role === "DEVELOPER");
const currentUserId = computed(() => currentUser.value?.id ?? null);

const canUseChat = computed(() => {
  if (!currentUser.value || !project.value) return false;
  if (currentUser.value.role === "DEVELOPER") return true;
  const userId = currentUser.value.id;
  return project.value.members.some((member) => member.id === userId);
});

const { messages, newMessage, loadMessages, sendMessage, subscribe, unsubscribe } = useProjectChat(projectId);

const { newTaskTitle, loadTasks, canCreateTask, createTask, moveTask, removeTask, columnTasks } = useProjectTasks(
  projectId,
  currentUser,
  project
);

const {
  images,
  openedImage,
  showUploadModal,
  uploadError,
  loadImages,
  onImageSelect,
  uploadImage,
  deleteImage,
  openImagePreview,
  closeImagePreview
} = useProjectImages(projectId);

const { links, newUrl, linkError, adding, loadLinks, addLink, deleteLink } = useProjectLinks(projectId);

const onAddClient = async (clientId: number) => {
  await addClientToProject(clientId);
  await loadProject();
};

const onRemoveClient = async (clientId: number) => {
  await removeClientFromProject(clientId);
  await loadProject();
};

const onOpenMembers = async () => {
  showMembersModal.value = true;
  if (isDeveloper.value) {
    await loadUsers();
  }
};

await loadProject();
await loadTasks();
await loadImages();
await loadLinks();

if (canUseChat.value) {
  await loadMessages();
}

onMounted(async () => {
  if (isDeveloper.value) {
    await loadUsers();
  }
  if (canUseChat.value) {
    subscribe();
  }
});

onBeforeUnmount(unsubscribe);
</script>

<template>
  <div
    v-if="error && !project"
    class="glass-panel border-rose-300/70 bg-rose-50/80 p-3 text-sm text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/20 dark:text-rose-300"
  >
    {{ error }}
  </div>
  <ProjectDetailsPage
    v-if="project"
    :project="project"
    :error="error"
    :is-developer="isDeveloper"
    :can-use-chat="canUseChat"
    :can-create-task="canCreateTask"
    :active-tab="activeTab"
    :show-edit="showEdit"
    :show-members-modal="showMembersModal"
    :show-upload-modal="showUploadModal"
    :edit-form="editForm"
    :available-clients="availableClients"
    :images="images"
    :opened-image="openedImage"
    :upload-error="uploadError"
    :links="links"
    :links-new-url="newUrl"
    :links-error="linkError"
    :links-adding="adding"
    :tasks-column="columnTasks"
    :new-task-title="newTaskTitle"
    :messages="messages"
    :current-user-id="currentUserId"
    :new-message="newMessage"
    @set-tab="activeTab = $event"
    @toggle-edit="showEdit = !showEdit"
    @open-members="onOpenMembers"
    @close-members="showMembersModal = false"
    @archive="archiveProject"
    @save-project="saveProject"
    @open-upload="showUploadModal = true"
    @close-upload="showUploadModal = false"
    @image-select="onImageSelect"
    @upload-image="uploadImage"
    @delete-image="deleteImage"
    @open-image="openImagePreview"
    @close-image="closeImagePreview"
    @add-link="addLink"
    @delete-link="deleteLink"
    @update:links-new-url="newUrl = $event"
    @add-client="onAddClient"
    @remove-client="onRemoveClient"
    @update:new-task-title="newTaskTitle = $event"
    @create-task="createTask"
    @move-task="moveTask"
    @remove-task="removeTask"
    @update:new-message="newMessage = $event"
    @send-message="sendMessage"
  />
</template>
