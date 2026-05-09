/**
 * Клиентский плагин: при старте приложения дергает /api/auth/me и заполняет useState("current-user"),
 * чтобы сессия была известна как можно раньше (в т.ч. до переходов), в связке с тем же состоянием, что в layout.
 */
import { useInitActiveUser } from "~/shared/api";

export default defineNuxtPlugin(async () => {
  await useInitActiveUser();
});
