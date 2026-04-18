import { api } from "./api";

export const sendChat = async ({
  prompt,
  conversationId,
}: {
  prompt: string;
  conversationId: string;
}) => {
  const res = await api.post(
    `/ai/chat?conversationId=${conversationId}`,
    prompt,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );

  return res.data
};
