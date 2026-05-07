import type { ProjectImage } from "~/shared/types/domain";
import { useApi } from "~/shared/api/client";

export const useProjectImages = (projectId: Ref<number>) => {
  const images = ref<ProjectImage[]>([]);
  const selectedImageFile = ref<File | null>(null);
  const openedImage = ref<ProjectImage | null>(null);
  const showUploadModal = ref(false);
  const uploadError = ref("");

  const loadImages = async () => {
    try {
      images.value = await useApi<ProjectImage[]>(`/api/projects/${projectId.value}/images`);
    } catch {
      images.value = [];
    }
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
      await useApi(`/api/projects/${projectId.value}/images`, {
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
    await useApi(`/api/projects/${projectId.value}/images/${imageId}`, { method: "DELETE" });
    await loadImages();
  };

  const openImagePreview = (image: ProjectImage) => {
    openedImage.value = image;
  };

  const closeImagePreview = () => {
    openedImage.value = null;
  };

  const onEscapeKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") closeImagePreview();
  };

  onMounted(() => window.addEventListener("keydown", onEscapeKey));
  onBeforeUnmount(() => window.removeEventListener("keydown", onEscapeKey));

  return {
    images,
    selectedImageFile,
    openedImage,
    showUploadModal,
    uploadError,
    loadImages,
    onImageSelect,
    uploadImage,
    deleteImage,
    openImagePreview,
    closeImagePreview
  };
};

