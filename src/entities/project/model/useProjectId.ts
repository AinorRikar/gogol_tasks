export const useProjectId = () => {
  const route = useRoute();
  const raw = route.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return computed(() => Number(value));
};

