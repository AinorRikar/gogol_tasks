<script setup lang="ts">
import type { ChatMessage, ProjectImage, ProjectListItem, ProjectTask, TaskStatus, User } from "~/shared/types/domain";
import { useApi, useCurrentUser } from "~/shared/api/client";

const route = useRoute();
const currentUser = useCurrentUser();
const project = ref<ProjectListItem | null>(null);
const messages = ref<ChatMessage[]>([]);
const tasks = ref<ProjectTask[]>([]);
const images = ref<ProjectImage[]>([]);
const users = ref<User[]>([]);
const newMessage = ref("");
const error = ref("");
const showEdit = ref(false);
const showMembersModal = ref(false);
const showUploadModal = ref(false);
const newTaskTitle = ref("");
const activeTab = ref<"overview" | "kanban" | "chat">("overview");
const selectedImageFile = ref<File | null>(null);
const openedImage = ref<ProjectImage | null>(null);
const uploadError = ref("");
const editForm = reactive({
  title: "",
  description: "",
  status: "PLANNING" as ProjectListItem["status"],
  visibility: true,
  hidden: false
});

const projectId = Number(route.params.id);

const loadProject = async () => {
  try {
    error.value = "";
    project.value = await useApi<ProjectListItem>(`/api/projects/${projectId}`);
    if (project.value) {
      editForm.title = project.value.title;
      editForm.description = project.value.description ?? "";
      editForm.status = project.value.status;
      editForm.visibility = project.value.visibility;
      editForm.hidden = project.value.hidden;
    }
  } catch {
    error.value = "Нет доступа или проект не найден";
  }
};

const loadMessages = async () => {
  try {
    messages.value = await useApi<ChatMessage[]>(`/api/projects/${projectId}/chat`);
  } catch {
    messages.value = [];
  }
};

const loadTasks = async () => {
  try {
    tasks.value = await useApi<ProjectTask[]>(`/api/projects/${projectId}/tasks`);
  } catch {
    tasks.value = [];
  }
};

const loadImages = async () => {
  try {
    images.value = await useApi<ProjectImage[]>(`/api/projects/${projectId}/images`);
  } catch {
    images.value = [];
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  await useApi(`/api/projects/${projectId}/chat`, {
    method: "POST",
    body: { text: newMessage.value.trim() }
  });
  newMessage.value = "";
  await loadMessages();
};

const saveProject = async () => {
  await useApi(`/api/projects/${projectId}`, {
    method: "PATCH",
    body: editForm
  });
  showEdit.value = false;
  await loadProject();
};

const archiveProject = async () => {
  await useApi(`/api/projects/${projectId}/archive`, { method: "POST" });
  await loadProject();
};

const clients = computed(() => users.value.filter((user) => user.role === "CLIENT"));
const assignedMemberIds = computed(() => new Set((project.value?.members ?? []).map((member) => member.id)));
const availableClients = computed(() => clients.value.filter((client) => !assignedMemberIds.value.has(client.id)));

const addClientToProject = async (clientId: number) => {
  await useApi(`/api/projects/${projectId}/members`, {
    method: "POST",
    body: { userId: clientId }
  });
  await loadProject();
};

const removeClientFromProject = async (clientId: number) => {
  await useApi(`/api/projects/${projectId}/members/${clientId}`, { method: "DELETE" });
  await loadProject();
};

const createTask = async () => {
  if (!newTaskTitle.value.trim()) return;
  await useApi(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    body: {
      title: newTaskTitle.value.trim()
    }
  });
  newTaskTitle.value = "";
  await loadTasks();
};

const moveTask = async (task: ProjectTask, status: TaskStatus) => {
  await useApi(`/api/projects/${projectId}/tasks/${task.id}`, {
    method: "PATCH",
    body: {
      status
    }
  });
  await loadTasks();
};

const removeTask = async (task: ProjectTask) => {
  await useApi(`/api/projects/${projectId}/tasks/${task.id}`, { method: "DELETE" });
  await loadTasks();
};

const onImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  selectedImageFile.value = input.files?.[0] ?? null;
};

const uploadImage = async () => {
  if (!selectedImageFile.value) return;
  const formData = new FormData();
  formData.append("file", selectedImageFile.value);
  try {
    uploadError.value = "";
    await useApi(`/api/projects/${projectId}/images`, {
      method: "POST",
      body: formData
    });
    selectedImageFile.value = null;
    showUploadModal.value = false;
    await loadImages();
  } catch {
    uploadError.value = "Не удалось загрузить изображение";
  }
};

const deleteImage = async (imageId: number) => {
  await useApi(`/api/projects/${projectId}/images/${imageId}`, { method: "DELETE" });
  await loadImages();
};

const openImagePreview = (image: ProjectImage) => {
  openedImage.value = image;
};

const closeImagePreview = () => {
  openedImage.value = null;
};

const columnTasks = (status: TaskStatus) => tasks.value.filter((task) => task.status === status);
const isDeveloper = computed(() => currentUser.value?.role === "DEVELOPER");
const currentUserId = computed(() => currentUser.value?.id ?? null);
const canUseChat = computed(() => {
  if (!currentUser.value || !project.value) return false;
  if (currentUser.value.role === "DEVELOPER") return true;
  return project.value.members.some((member) => member.id === currentUser.value.id);
});

const formatMessageDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
const canCreateTask = computed(() => {
  if (!currentUser.value || !project.value) return false;
  if (currentUser.value.role === "DEVELOPER") return true;
  return project.value.members.some((member) => member.id === currentUser.value?.id);
});

await loadProject();
await loadTasks();
await loadImages();
users.value = await useApi<User[]>("/api/users");
if (canUseChat.value) {
  await loadMessages();
}

let source: EventSource | null = null;
const onEscapeKey = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeImagePreview();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onEscapeKey);
  if (!canUseChat.value) return;
  source = new EventSource(`/api/projects/${projectId}/chat/stream`, { withCredentials: true });
  source.addEventListener("messages", (event) => {
    const payload = JSON.parse((event as MessageEvent).data) as ChatMessage[];
    messages.value = payload;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEscapeKey);
  source?.close();
});
</script>

<template>
  <div class="space-y-5">
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300">
      <Icon name="material-symbols:arrow-back-rounded" class="h-4 w-4" />
      Назад к проектам
    </NuxtLink>
    <div v-if="error" class="glass-panel border-rose-300/70 bg-rose-50/80 p-3 text-sm text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/20 dark:text-rose-300">
      {{ error }}
    </div>
    <template v-else-if="project">
      <div class="mx-auto flex w-full max-w-2xl items-center justify-center border-b border-zinc-200/70 pb-2 dark:border-zinc-700/70">
        <button
          class="relative -mb-2 rounded-t-2xl px-6 py-3 text-base font-semibold transition"
          :class="
            activeTab === 'overview'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          "
          @click="activeTab = 'overview'"
        >
          <Icon name="material-symbols:overview-rounded" class="mr-1 inline-block h-5 w-5 align-text-bottom" />
          Проект
        </button>
        <button
          class="relative -mb-2 rounded-t-2xl px-6 py-3 text-base font-semibold transition"
          :class="
            activeTab === 'kanban'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          "
          @click="activeTab = 'kanban'"
        >
          <Icon name="material-symbols:view-kanban-rounded" class="mr-1 inline-block h-5 w-5 align-text-bottom" />
          Канбан
        </button>
        <button
          v-if="canUseChat"
          class="relative -mb-2 rounded-t-2xl px-6 py-3 text-base font-semibold transition"
          :class="
            activeTab === 'chat'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          "
          @click="activeTab = 'chat'"
        >
          <Icon name="material-symbols:chat-rounded" class="mr-1 inline-block h-5 w-5 align-text-bottom" />
          Чат
        </button>
      </div>
      <section v-if="activeTab === 'overview'" class="glass-panel p-5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h1 class="text-2xl font-semibold tracking-tight">{{ project.title }}</h1>
            <p v-if="project.archivedAt" class="text-xs text-amber-600 dark:text-amber-400">Проект в архиве</p>
          </div>
          <div v-if="isDeveloper" class="flex gap-2">
            <button class="soft-button inline-flex items-center gap-1 py-1.5" @click="showEdit = !showEdit">
              <Icon name="material-symbols:edit-rounded" class="h-4 w-4" />
              Редактировать
            </button>
            <button class="soft-button inline-flex items-center gap-1 py-1.5" @click="showMembersModal = true">
              <Icon name="material-symbols:groups-rounded" class="h-4 w-4" />
              Заказчики
            </button>
            <button class="soft-button inline-flex items-center gap-1 border-amber-300/80 text-amber-700 dark:border-amber-800/80 dark:text-amber-400" @click="archiveProject">
              <Icon name="material-symbols:archive-rounded" class="h-4 w-4" />
              Архивировать
            </button>
          </div>
        </div>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">{{ project.description || "Описание недоступно" }}</p>
        <section class="glass-panel mt-4 space-y-3 p-4">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Галерея снимков</h2>
            <button
              v-if="isDeveloper"
              class="accent-button py-1.5"
              @click="showUploadModal = true"
            >
              <Icon name="material-symbols:upload-rounded" class="h-4 w-4" />
              Загрузить снимок
            </button>
          </div>
          <div v-if="images.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <article v-for="image in images" :key="image.id" class="rounded-xl border border-zinc-200/80 bg-white/70 p-2 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/70">
              <img
                :src="image.fileUrl"
                :alt="image.fileName"
                class="h-44 w-full cursor-zoom-in rounded object-cover"
                @click="openImagePreview(image)"
              />
              <div class="mt-2 flex items-center justify-between gap-2">
                <p class="truncate text-xs text-zinc-500">{{ image.fileName }}</p>
                <button
                  v-if="isDeveloper"
                  class="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 px-2 py-1 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300"
                  @click="deleteImage(image.id)"
                >
                  <Icon name="material-symbols:delete-rounded" class="h-4 w-4" />
                  Удалить
                </button>
              </div>
            </article>
          </div>
          <p v-else class="text-sm text-zinc-500">Снимков пока нет.</p>
        </section>
        <form v-if="showEdit" class="mt-3 grid gap-2" @submit.prevent="saveProject">
          <input v-model="editForm.title" class="soft-input" />
          <textarea
            v-model="editForm.description"
            class="soft-input min-h-24"
          />
          <div class="flex gap-2">
            <select v-model="editForm.status" class="soft-input">
              <option value="ACTIVE">Активный</option>
              <option value="COMPLETED">Завершенный</option>
              <option value="ABANDONED">Заброшенный</option>
              <option value="SUPPORTED">Поддержка</option>
              <option value="PLANNING">Планируется</option>
            </select>
            <label class="glass-panel flex items-center gap-2 px-3 py-2 text-sm">
              <input v-model="editForm.visibility" type="checkbox" />
              Public
            </label>
            <label class="glass-panel flex items-center gap-2 px-3 py-2 text-sm">
              <input v-model="editForm.hidden" type="checkbox" />
              Hidden
            </label>
          </div>
          <button class="accent-button inline-flex w-fit items-center gap-1">
            <Icon name="material-symbols:save-rounded" class="h-4 w-4" />
            Сохранить
          </button>
        </form>
      </section>
      <section
        v-if="showUploadModal && isDeveloper && activeTab === 'overview'"
        class="glass-panel p-4"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-semibold">Загрузка снимка</h2>
          <button class="soft-button inline-flex items-center gap-1 py-1 text-xs" @click="showUploadModal = false">
            <Icon name="material-symbols:close-rounded" class="h-4 w-4" />
            Закрыть
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input type="file" accept="image/*" class="soft-input py-1 text-sm" @change="onImageSelect" />
          <button class="accent-button inline-flex items-center gap-1" @click="uploadImage">
            <Icon name="material-symbols:save-rounded" class="h-4 w-4" />
            Сохранить в галерею
          </button>
          <p v-if="uploadError" class="text-sm text-rose-500">{{ uploadError }}</p>
        </div>
      </section>
      <section
        v-if="showMembersModal && isDeveloper && activeTab === 'overview'"
        class="glass-panel p-4"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-semibold">Управление заказчиками проекта</h2>
          <button class="soft-button inline-flex items-center gap-1 py-1 text-xs" @click="showMembersModal = false">
            <Icon name="material-symbols:close-rounded" class="h-4 w-4" />
            Закрыть
          </button>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <h3 class="mb-2 text-sm font-semibold">Назначенные</h3>
            <div class="space-y-2">
              <div v-for="member in project.members" :key="member.id" class="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/70 p-2 text-sm dark:border-zinc-700/80 dark:bg-zinc-900/70">
                <span>{{ member.name }}</span>
                <button class="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 px-2 py-1 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300" @click="removeClientFromProject(member.id)">
                  <Icon name="material-symbols:person-remove-rounded" class="h-4 w-4" />
                  Удалить
                </button>
              </div>
              <p v-if="!project.members.length" class="text-xs text-zinc-500">Пока никто не назначен.</p>
            </div>
          </div>
          <div>
            <h3 class="mb-2 text-sm font-semibold">Доступные заказчики</h3>
            <div class="space-y-2">
              <div
                v-for="client in availableClients"
                :key="client.id"
                class="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/70 p-2 text-sm dark:border-zinc-700/80 dark:bg-zinc-900/70"
              >
                <span>{{ client.name }}</span>
                <button class="soft-button inline-flex items-center gap-1 py-1 text-xs" @click="addClientToProject(client.id)">
                  <Icon name="material-symbols:person-add-rounded" class="h-4 w-4" />
                  Добавить
                </button>
              </div>
              <p v-if="!availableClients.length" class="text-xs text-zinc-500">Нет доступных заказчиков.</p>
            </div>
          </div>
        </div>
      </section>
      <section v-if="canUseChat && activeTab === 'chat'" class="glass-panel flex h-[calc(100vh-16rem)] min-h-[540px] flex-col p-4">
        <h2 class="mb-3 font-semibold">Чат проекта</h2>
        <div class="flex-1 space-y-2 overflow-y-auto pr-1">
          <div
            v-for="message in messages"
            :key="message.id"
            class="flex"
            :class="message.author.id === currentUserId ? 'justify-start' : 'justify-end'"
          >
            <article
              class="max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm"
              :class="
                message.author.id === currentUserId
                  ? 'border border-sky-200/80 bg-sky-50/80 text-zinc-800 dark:border-sky-700/50 dark:bg-sky-900/25 dark:text-zinc-100'
                  : 'border border-violet-200/80 bg-violet-50/80 text-zinc-800 dark:border-violet-700/50 dark:bg-violet-900/25 dark:text-zinc-100'
              "
            >
              <div class="mb-1 text-xs font-semibold text-zinc-500">
                {{ message.author.name }}
              </div>
              <p class="leading-relaxed">{{ message.text }}</p>
              <p v-if="message.sentAt" class="mt-1 text-[11px] text-zinc-400">
                {{ formatMessageDate(message.sentAt) }}
              </p>
            </article>
          </div>
        </div>
        <div class="mt-3 flex gap-2 border-t border-zinc-200/70 pt-3 dark:border-zinc-700/70">
          <input
            v-model="newMessage"
            type="text"
            class="soft-input flex-1"
            placeholder="Введите сообщение"
            @keydown.enter.prevent="sendMessage"
          />
          <button class="accent-button inline-flex shrink-0 items-center gap-1" @click="sendMessage">
            <Icon name="material-symbols:send-rounded" class="h-4 w-4" />
            Отправить
          </button>
        </div>
      </section>
      <section v-if="activeTab === 'kanban'" class="glass-panel p-4">
        <h2 class="mb-3 font-semibold">Канбан задачи</h2>
        <div v-if="canCreateTask" class="mb-3 flex flex-wrap gap-2">
          <input
            v-model="newTaskTitle"
            placeholder="Новая задача"
            class="soft-input min-w-52"
          />
          <button class="accent-button inline-flex items-center gap-1" @click="createTask">
            <Icon name="material-symbols:add-task-rounded" class="h-4 w-4" />
            Добавить
          </button>
        </div>
        <p v-else class="mb-3 text-sm text-zinc-500">Только назначенный заказчик или разработчик может добавлять задачи.</p>
        <div class="grid gap-3 md:grid-cols-3">
          <div v-for="col in ['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]" :key="col" class="rounded-2xl border border-zinc-200/80 bg-white/70 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/70">
            <h3 class="mb-2 text-sm font-semibold">{{ col }}</h3>
            <div class="space-y-2">
              <div v-for="task in columnTasks(col)" :key="task.id" class="rounded-xl border border-zinc-200/80 bg-white/80 p-2 text-sm dark:border-zinc-700/80 dark:bg-zinc-900/80">
                <p class="font-medium">{{ task.title }}</p>
                <p class="text-xs text-zinc-500">{{ task.assignee?.name || "Без исполнителя" }}</p>
                <div class="mt-2 flex flex-wrap gap-1">
                  <button
                    v-for="target in ['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]"
                    :key="target"
                    class="rounded-lg border border-zinc-300/80 px-1.5 py-0.5 text-xs dark:border-zinc-700/80"
                    @click="moveTask(task, target)"
                  >
                    {{ target }}
                  </button>
                  <button class="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 px-1.5 py-0.5 text-xs text-rose-700 dark:border-rose-800/80 dark:text-rose-300" @click="removeTask(task)">
                    <Icon name="material-symbols:delete-rounded" class="h-4 w-4" />
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div
        v-if="openedImage"
        class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-4 backdrop-blur-sm"
        @click.self="closeImagePreview"
      >
        <button
          class="absolute right-4 top-4 inline-flex items-center gap-1 rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
          @click="closeImagePreview"
        >
          <Icon name="material-symbols:close-rounded" class="h-4 w-4" />
          Закрыть
        </button>
        <img
          :src="openedImage.fileUrl"
          :alt="openedImage.fileName"
          class="max-h-[92vh] w-auto max-w-[96vw] rounded-xl object-contain shadow-2xl"
        />
      </div>
    </template>
  </div>
</template>
