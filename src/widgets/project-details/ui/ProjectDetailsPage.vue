<script setup lang="ts">
import { ProjectEditForm, TechStackEditor } from "~/features/project-edit";
import { ProjectChatPanel } from "~/features/project-chat";
import { ProjectGallery, ImagePreviewOverlay } from "~/features/project-images";
import { ProjectMembersManager } from "~/features/project-members";
import { ProjectKanbanBoard } from "~/features/project-tasks";
import { ProjectLinksBar, ProjectLinksManager } from "~/features/project-links";
import { ReferenceBlocksPanel } from "~/features/project-reference-blocks";
import type {
  ProjectImage,
  ProjectLink,
  ProjectListItem,
  ProjectReferenceBlock,
  ProjectTask,
  TaskStatus,
  ChatMessage,
  User
} from "~/shared/types";
import { classesForTechTag } from "~/shared/lib";

defineProps<{
  project: ProjectListItem;
  error: string;
  isDeveloper: boolean;
  canUseChat: boolean;
  canCreateTask: boolean;

  activeTab: "overview" | "kanban" | "chat";
  showEdit: boolean;
  showMembersModal: boolean;
  showUploadModal: boolean;

  editForm: {
    title: string;
    shortDescription: string;
    fullDescription: string;
    version: string;
    status: ProjectListItem["status"];
    visibility: boolean;
    hidden: boolean;
    useForPortfolio: boolean;
    techStack: string;
  };

  referenceBlocks: ProjectReferenceBlock[];
  referenceBlocksLoading: boolean;
  referenceBlocksError: string;
  referenceNewTitle: string;
  referenceNewContent: string;

  availableClients: User[];

  images: ProjectImage[];
  openedImage: ProjectImage | null;
  uploadError: string;

  links: ProjectLink[];
  linksNewUrl: string;
  linksError: string;
  linksAdding: boolean;

  tasksColumn: (status: TaskStatus) => ProjectTask[];
  newTaskTitle: string;

  messages: ChatMessage[];
  currentUserId: number | null;
  newMessage: string;
}>();

const emit = defineEmits<{
  back: [];
  setTab: [tab: "overview" | "kanban" | "chat"];

  toggleEdit: [];
  openMembers: [];
  closeMembers: [];
  archive: [];
  saveProject: [];

  openUpload: [];
  closeUpload: [];
  imageSelect: [event: Event];
  uploadImage: [];
  deleteImage: [imageId: number];
  openImage: [image: ProjectImage];
  closeImage: [];

  addLink: [];
  deleteLink: [linkId: number];
  "update:linksNewUrl": [value: string];

  addClient: [clientId: number];
  removeClient: [clientId: number];

  "update:newTaskTitle": [value: string];
  createTask: [];
  moveTask: [task: ProjectTask, status: TaskStatus];
  removeTask: [task: ProjectTask];

  "update:newMessage": [value: string];
  sendMessage: [];

  createReferenceBlock: [];
  saveReferenceBlock: [block: ProjectReferenceBlock];
  deleteReferenceBlock: [blockId: number];
  "update:referenceNewTitle": [value: string];
  "update:referenceNewContent": [value: string];
}>();

const techStackTags = (csv: string) => csv.split(",").map((s) => s.trim()).filter(Boolean);

const techStackEditorRef = ref<{ flushPending: () => void } | null>(null);

const onSaveProject = () => {
  techStackEditorRef.value?.flushPending();
  emit("saveProject");
};
</script>

<template>
  <div class="space-y-5">
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300"
    >
      <Icon name="material-symbols:arrow-back-rounded" class="h-4 w-4" />
      Назад к проектам
    </NuxtLink>

    <div
      v-if="error"
      class="glass-panel border-rose-300/70 bg-rose-50/80 p-3 text-sm text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/20 dark:text-rose-300"
    >
      {{ error }}
    </div>

    <template v-else>
      <div
        class="mx-auto flex w-full max-w-2xl items-center justify-center border-b border-zinc-200/70 pb-2 dark:border-zinc-700/70"
      >
        <button
          class="relative -mb-2 rounded-t-2xl px-6 py-3 text-base font-semibold transition"
          :class="
            activeTab === 'overview'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          "
          @click="emit('setTab', 'overview')"
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
          @click="emit('setTab', 'kanban')"
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
          @click="emit('setTab', 'chat')"
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
            <button class="soft-button inline-flex items-center gap-1 py-1.5" @click="emit('toggleEdit')">
              <Icon name="material-symbols:edit-rounded" class="h-4 w-4" />
            </button>
            <button class="soft-button inline-flex items-center gap-1 py-1.5" @click="emit('openMembers')">
              <Icon name="material-symbols:groups-rounded" class="h-4 w-4" />
            </button>
            <button
              class="soft-button inline-flex items-center gap-1 border-amber-300/80 text-amber-700 dark:border-amber-800/80 dark:text-amber-400"
              @click="emit('archive')"
            >
              <Icon name="material-symbols:archive-rounded" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <p v-if="project.version" class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Версия {{ project.version }}</p>
        <div v-if="project.fullDescription" class="mt-3">
          <p class="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Описание
          </p>
          <p class="whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">{{ project.fullDescription }}</p>
        </div>
        <p v-else class="mt-2 text-zinc-600 dark:text-zinc-300">Описание недоступно</p>

        <ReferenceBlocksPanel
          v-if="isDeveloper"
          :blocks="referenceBlocks"
          :loading="referenceBlocksLoading"
          :error="referenceBlocksError"
          :new-title="referenceNewTitle"
          :new-content="referenceNewContent"
          @update:new-title="emit('update:referenceNewTitle', $event)"
          @update:new-content="emit('update:referenceNewContent', $event)"
          @create="emit('createReferenceBlock')"
          @save="emit('saveReferenceBlock', $event)"
          @delete="emit('deleteReferenceBlock', $event)"
        />

        <div class="mt-4">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Стек</p>
          <TechStackEditor
            v-if="showEdit && isDeveloper"
            ref="techStackEditorRef"
            v-model="editForm.techStack"
          />
          <template v-else-if="techStackTags(project.techStack).length">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, idx) in techStackTags(project.techStack)"
                :key="`${idx}-${tag}`"
                class="inline-flex rounded-lg border px-2.5 py-1 text-sm font-medium"
                :class="classesForTechTag(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </template>
          <p v-else class="text-sm text-zinc-500 dark:text-zinc-400">Не указан</p>
        </div>

        <ProjectLinksBar :links="links" />

        <ProjectLinksManager
          v-if="isDeveloper"
          :new-url="linksNewUrl"
          :links="links"
          :link-error="linksError"
          :adding="linksAdding"
          @update:new-url="emit('update:linksNewUrl', $event)"
          @add="emit('addLink')"
          @delete="emit('deleteLink', $event)"
        />

        <ProjectGallery
          :images="images"
          :is-developer="isDeveloper"
          @upload="emit('openUpload')"
          @open="emit('openImage', $event)"
          @delete="emit('deleteImage', $event)"
        />

        <ProjectEditForm v-if="showEdit" :edit-form="editForm" @save="onSaveProject" />
      </section>

      <section v-if="showUploadModal && isDeveloper && activeTab === 'overview'" class="glass-panel p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-semibold">Загрузка снимка</h2>
          <button class="soft-button inline-flex items-center gap-1 py-1 text-xs" @click="emit('closeUpload')">
            <Icon name="material-symbols:close-rounded" class="h-4 w-4" />
            Закрыть
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input type="file" accept="image/*" class="soft-input py-1 text-sm" @change="emit('imageSelect', $event)" />
          <button class="accent-button inline-flex items-center gap-1" @click="emit('uploadImage')">
            <Icon name="material-symbols:save-rounded" class="h-4 w-4" />
            Сохранить в галерею
          </button>
          <p v-if="uploadError" class="text-sm text-rose-500">{{ uploadError }}</p>
        </div>
      </section>

      <template v-if="showMembersModal && isDeveloper && activeTab === 'overview'">
        <ProjectMembersManager
          :project="project"
          :available-clients="availableClients"
          @close="emit('closeMembers')"
          @add="emit('addClient', $event)"
          @remove="emit('removeClient', $event)"
        />
      </template>

      <ProjectChatPanel
        v-if="canUseChat && activeTab === 'chat'"
        :messages="messages"
        :current-user-id="currentUserId"
        :new-message="newMessage"
        @update:new-message="emit('update:newMessage', $event)"
        @send="emit('sendMessage')"
      />

      <ProjectKanbanBoard
        v-if="activeTab === 'kanban'"
        :can-create-task="canCreateTask"
        :new-task-title="newTaskTitle"
        :column-tasks="tasksColumn"
        @update:new-task-title="emit('update:newTaskTitle', $event)"
        @create="emit('createTask')"
        @move="(task, status) => emit('moveTask', task, status)"
        @remove="emit('removeTask', $event)"
      />

      <ImagePreviewOverlay :opened-image="openedImage" @close="emit('closeImage')" />
    </template>
  </div>
</template>

