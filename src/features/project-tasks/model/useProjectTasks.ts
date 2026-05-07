import type { ProjectListItem, ProjectTask, TaskStatus, User } from "~/shared/types/domain";
import { useApi } from "~/shared/api/client";

export const useProjectTasks = (
  projectId: Ref<number>,
  currentUser: Ref<User | null>,
  project: Ref<ProjectListItem | null>
) => {
  const tasks = ref<ProjectTask[]>([]);
  const newTaskTitle = ref("");

  const loadTasks = async () => {
    try {
      tasks.value = await useApi<ProjectTask[]>(`/api/projects/${projectId.value}/tasks`);
    } catch {
      tasks.value = [];
    }
  };

  const canCreateTask = computed(() => {
    if (!currentUser.value || !project.value) return false;
    if (currentUser.value.role === "DEVELOPER") return true;
    const userId = currentUser.value.id;
    return project.value.members.some((member) => member.id === userId);
  });

  const createTask = async () => {
    if (!newTaskTitle.value.trim()) return;
    await useApi(`/api/projects/${projectId.value}/tasks`, {
      method: "POST",
      body: {
        title: newTaskTitle.value.trim()
      }
    });
    newTaskTitle.value = "";
    await loadTasks();
  };

  const moveTask = async (task: ProjectTask, status: TaskStatus) => {
    await useApi(`/api/projects/${projectId.value}/tasks/${task.id}`, {
      method: "PATCH",
      body: {
        status
      }
    });
    await loadTasks();
  };

  const removeTask = async (task: ProjectTask) => {
    await useApi(`/api/projects/${projectId.value}/tasks/${task.id}`, { method: "DELETE" });
    await loadTasks();
  };

  const columnTasks = (status: TaskStatus) => tasks.value.filter((task) => task.status === status);

  return {
    tasks,
    newTaskTitle,
    loadTasks,
    canCreateTask,
    createTask,
    moveTask,
    removeTask,
    columnTasks
  };
};

