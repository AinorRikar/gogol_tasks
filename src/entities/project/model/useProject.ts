import type { ProjectListItem } from "~/shared/types";
import { useApi } from "~/shared/api";

export const useProject = (projectId: Ref<number>) => {
  const project = ref<ProjectListItem | null>(null);
  const error = ref("");
  const showEdit = ref(false);

  const editForm = reactive({
    title: "",
    shortDescription: "",
    fullDescription: "",
    version: "",
    status: "PLANNING" as ProjectListItem["status"],
    visibility: true,
    hidden: false,
    useForPortfolio: false,
    techStack: ""
  });

  const hydrateEditForm = (value: ProjectListItem) => {
    editForm.title = value.title;
    editForm.shortDescription = value.shortDescription ?? "";
    editForm.fullDescription = value.fullDescription ?? "";
    editForm.version = value.version ?? "";
    editForm.status = value.status;
    editForm.visibility = value.visibility;
    editForm.hidden = value.hidden;
    editForm.useForPortfolio = value.useForPortfolio;
    editForm.techStack = value.techStack ?? "";
  };

  const loadProject = async () => {
    try {
      error.value = "";
      project.value = await useApi<ProjectListItem>(`/api/projects/${projectId.value}`);
      if (project.value) hydrateEditForm(project.value);
    } catch {
      project.value = null;
      error.value = "Нет доступа или проект не найден";
    }
  };

  const saveProject = async () => {
    await useApi(`/api/projects/${projectId.value}`, {
      method: "PATCH",
      body: editForm
    });
    showEdit.value = false;
    await loadProject();
  };

  const archiveProject = async () => {
    await useApi(`/api/projects/${projectId.value}/archive`, { method: "POST" });
    await loadProject();
  };

  return {
    project,
    error,
    showEdit,
    editForm,
    loadProject,
    saveProject,
    archiveProject
  };
};
