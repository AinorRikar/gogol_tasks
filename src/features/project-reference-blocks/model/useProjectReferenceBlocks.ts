import type { ProjectReferenceBlock } from "~/shared/types";
import { useApi } from "~/shared/api";

export const useProjectReferenceBlocks = (projectId: Ref<number>) => {
  const blocks = ref<ProjectReferenceBlock[]>([]);
  const loading = ref(false);
  const error = ref("");

  const newBlock = reactive({
    title: "",
    content: ""
  });

  const loadBlocks = async () => {
    loading.value = true;
    error.value = "";
    try {
      blocks.value = await useApi<ProjectReferenceBlock[]>(
        `/api/projects/${projectId.value}/reference-blocks`
      );
    } catch {
      blocks.value = [];
      error.value = "Не удалось загрузить справочные блоки";
    } finally {
      loading.value = false;
    }
  };

  const createBlock = async () => {
    if (!newBlock.title.trim() || !newBlock.content.trim()) return;
    error.value = "";
    try {
      const created = await useApi<ProjectReferenceBlock>(
        `/api/projects/${projectId.value}/reference-blocks`,
        {
          method: "POST",
          body: {
            title: newBlock.title.trim(),
            content: newBlock.content.trim()
          }
        }
      );
      blocks.value = [...blocks.value, created];
      newBlock.title = "";
      newBlock.content = "";
    } catch {
      error.value = "Не удалось добавить блок";
    }
  };

  const updateBlock = async (block: ProjectReferenceBlock) => {
    error.value = "";
    try {
      const updated = await useApi<ProjectReferenceBlock>(
        `/api/projects/${projectId.value}/reference-blocks/${block.id}`,
        {
          method: "PATCH",
          body: {
            title: block.title.trim(),
            content: block.content.trim()
          }
        }
      );
      blocks.value = blocks.value.map((item) => (item.id === updated.id ? updated : item));
    } catch {
      error.value = "Не удалось сохранить блок";
    }
  };

  const deleteBlock = async (blockId: number) => {
    if (!import.meta.client) return;
    if (!window.confirm("Удалить справочный блок?")) return;
    error.value = "";
    try {
      await useApi(`/api/projects/${projectId.value}/reference-blocks/${blockId}`, {
        method: "DELETE"
      });
      blocks.value = blocks.value.filter((block) => block.id !== blockId);
    } catch {
      error.value = "Не удалось удалить блок";
    }
  };

  return {
    blocks,
    loading,
    error,
    newBlock,
    loadBlocks,
    createBlock,
    updateBlock,
    deleteBlock
  };
};
