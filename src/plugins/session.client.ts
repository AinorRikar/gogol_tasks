import { useInitActiveUser } from "~/shared/api";

export default defineNuxtPlugin(async () => {
  await useInitActiveUser();
});
