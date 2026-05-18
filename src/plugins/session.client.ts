/**
 * После гидратации снова читаем /api/auth/me с cookie браузера (SSR мог отдать гостя без Cookie).
 */
import { useInitActiveUser } from "~/shared/api";

export default defineNuxtPlugin(async () => {
  await useInitActiveUser();
});
