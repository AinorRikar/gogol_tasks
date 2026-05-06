import { useInitActiveUser } from "~/shared/api/client";

export default defineNuxtPlugin(async () => {
  await useInitActiveUser();
});
