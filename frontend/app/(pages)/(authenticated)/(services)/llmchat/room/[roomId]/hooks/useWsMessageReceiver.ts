'use client';

// react
import { useEffect, type Dispatch, type SetStateAction } from 'react';
// features
import type { MessageListResponseData } from '@/features/api/llmchat';
// providers
import type { WebSocketCoreContextValue, ServerMessage } from '@/app/providers';
// include
import { customReceiveLogic } from './customReceiveLogic';


// type
type UseWsMessageReceiverProps = {
  wsContext:                 WebSocketCoreContextValue | null;
  serverMessage:             ServerMessage | null;
  roomId:                    string;
  setIsWsSend:               Dispatch<SetStateAction<boolean>>;
  setReceiveMessageListData: Dispatch<SetStateAction<MessageListResponseData>>;
  setMessageListData:        Dispatch<SetStateAction<MessageListResponseData>>;
  setSidebarInsetTitle?:     Dispatch<SetStateAction<string>> | undefined;
};

// useWsMessageReceiver
// - WebSocket 受信ロジック専用のカスタムフック
export function useWsMessageReceiver({
  wsContext,
  serverMessage,
  roomId,
  setIsWsSend,
  setReceiveMessageListData,
  setMessageListData,
  setSidebarInsetTitle, }: UseWsMessageReceiverProps) {

  useEffect(() => {
    // serverMessage が来た際のみ独自ロジックで処理を行う
    if (!wsContext || !serverMessage) return;

    const { cmd, status, ok, message, data } = serverMessage;

    // customReceiveLogicに渡して独自処理
    void customReceiveLogic({
      contextValue: wsContext,
      payload:      { cmd, status, ok, message, data },
      roomId,
      setIsWsSend,
      setReceiveMessageListData,
      setMessageListData,
      setSidebarInsetTitle,
    });

  }, [
    roomId,
    wsContext,
    serverMessage,
    setIsWsSend,
    setReceiveMessageListData,
    setMessageListData,
    setSidebarInsetTitle,
  ]);
};