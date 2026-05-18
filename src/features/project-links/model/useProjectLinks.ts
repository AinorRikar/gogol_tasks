import type { ProjectLink } from "~/shared/types";
import { useApi } from "~/shared/api";

export const useProjectLinks = (projectId: Ref<number>) => {
  const links = ref<ProjectLink[]>([]);
  const newUrl = ref("");
  const linkError = ref("");
  const adding = ref(false);

  const loadLinks = async () => {
    try {
      links.value = await useApi<ProjectLink[]>(`/api/projects/${projectId.value}/links`);
    } catch {
      links.value = [];
    }
  };

  const addLink = async () => {
    const url = newUrl.value.trim();
    if (!url) return;

    adding.value = true;
    linkError.value = "";
    try {
      const created = await useApi<ProjectLink>(`/api/projects/${projectId.value}/links`, {
        method: "POST",
        body: { url }
      });
      links.value = [...links.value, created];
      newUrl.value = "";
    } catch {
      linkError.value = "Не удалось добавить ссылку";
    } finally {
      adding.value = false;
    }
  };

  const deleteLink = async (linkId: number) => {
    await useApi(`/api/projects/${projectId.value}/links/${linkId}`, { method: "DELETE" });
    links.value = links.value.filter((link) => link.id !== linkId);
  };

  return {
    links,
    newUrl,
    linkError,
    adding,
    loadLinks,
    addLink,
    deleteLink
  };
};
