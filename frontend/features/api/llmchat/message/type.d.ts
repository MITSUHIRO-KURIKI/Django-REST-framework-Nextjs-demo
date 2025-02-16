export type MessageListResponseItem = {
  messageId:   string;
  userMessage: string | null;
  llmResponse: string | null;
};
export type MessageListResponseData = MessageListResponseItem[];