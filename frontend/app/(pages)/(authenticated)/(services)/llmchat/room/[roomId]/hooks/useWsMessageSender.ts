'use client';

// react
import { useEffect, type Dispatch, type SetStateAction } from 'react';
// providers
import type { WebSocketCoreContextValue } from '@/app/providers';
// features
import { generateUUIDHex } from '@/features/utils';
import type { MessageListResponseData } from '@/features/api/llmchat';


// type
type UseWsMessageSenderProps = {
  isWsSend:                  boolean;
  setIsWsSend:               Dispatch<SetStateAction<boolean>>;
  sendMessages:              string;
  setReceiveMessageListData: Dispatch<SetStateAction<MessageListResponseData>>;
  handleSendCore:            WebSocketCoreContextValue['handleSendCore'];
};

// useWsMessageSender
// - WebSocket 送信ロジック専用のカスタムフック
export function useWsMessageSender({
  isWsSend,
  setIsWsSend,
  sendMessages,
  setReceiveMessageListData,
  handleSendCore, }: UseWsMessageSenderProps) {

  useEffect(() => {
    // isWsSend=true で送信
    if (!isWsSend) return;

    // 空文字なら送信しない
    if (!sendMessages.trim()) {
      setIsWsSend(false);
      return;
    };

    // 受信メッセージの初期化
    setReceiveMessageListData([]);

    // messageListData への追加
    const messageId = generateUUIDHex();
    setReceiveMessageListData((prev) => [
      ...prev,
      {
        messageId:   messageId,
        userMessage: sendMessages,
        llmResponse: '',
      },
    ]);

    // WebSocket 送信
    handleSendCore({
      cmd:  'SendUserMessage',
      data: {
        messageId: messageId,
        message:   sendMessages,
      },
    });
    // setIsWsSend(false); は customReceiveLogic で行う
  }, [isWsSend]);
};