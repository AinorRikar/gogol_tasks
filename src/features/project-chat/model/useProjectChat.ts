import type { ChatMessage } from "~/shared/types";
import { useApi, withAppBase } from "~/shared/api";

export const useProjectChat = (projectId: Ref<number>) => {
  const messages = ref<ChatMessage[]>([]);
  const newMessage = ref("");

  const loadMessages = async () => {
    try {
      messages.value = await useApi<ChatMessage[]>(`/api/projects/${projectId.value}/chat`);
    } catch {
      messages.value = [];
    }
  };

  const sendMessage = async () => {
    if (!newMessage.value.trim()) return;
    await useApi(`/api/projects/${projectId.value}/chat`, {
      method: "POST",
      body: { text: newMessage.value.trim() }
    });
    newMessage.value = "";
    await loadMessages();
  };

  let source: EventSource | null = null;

  const subscribe = () => {
    if (source) return;
    source = new EventSource(withAppBase(`/api/projects/${projectId.value}/chat/stream`), {
      withCredentials: true
    });
    source.addEventListener("messages", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as ChatMessage[];
      messages.value = payload;
    });
  };

  const unsubscribe = () => {
    source?.close();
    source = null;
  };

  onBeforeUnmount(unsubscribe);

  return {
    messages,
    newMessage,
    loadMessages,
    sendMessage,
    subscribe,
    unsubscribe
  };
};

