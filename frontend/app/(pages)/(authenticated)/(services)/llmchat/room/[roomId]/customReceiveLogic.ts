/**
 * === Django consumer.py で以下を返す点に注意 ===
 * export type ServerMessage = {
 *   cmd:      string;
 *   status:   number;
 *   ok:       boolean;
 *   message?: string | null;
 *   data?: {
 *     [key: string]: unknown;
 *   };
 * };
 */
'use client';

// react
import type { Dispatch,  SetStateAction } from 'react';
// features
import { sanitizeDOMPurify } from '@/features/utils';
import type { WebSocketCoreContextValue, ServerMessage } from '@/app/providers';
// components
import { showToast } from '@/app/components/utils';
// type
import { type MessageListResponseData } from '@/features/api/llmchat';


// type
type CustomReceiveLogicProps = {
  contextValue:              WebSocketCoreContextValue;
  payload:                   ServerMessage;
  setIsWsSend:               Dispatch<SetStateAction<boolean>>;
  setReceiveMessageListData: Dispatch<SetStateAction<MessageListResponseData>>;
  setMessageListData:        Dispatch<SetStateAction<MessageListResponseData>>;
};

// customReceiveLogic ▽
export async function customReceiveLogic({contextValue, payload, setIsWsSend, setReceiveMessageListData, setMessageListData,}: CustomReceiveLogicProps): Promise<void> {

  const { setIsWebSocketWaiting } = contextValue;
  const { cmd, ok, data }         = payload;

  try {
    // SendUserMessage
    if (cmd === 'SendUserMessage') {
      if (ok) {
        const messageText = sanitizeDOMPurify(String(data?.llmResponse || ''));
        setReceiveMessageListData((prev) =>
          prev.map((msg) =>
            msg.messageId === data?.messageId
              ? { ...msg, llmResponse: msg.llmResponse + messageText }
              : msg
          )
        );
      } else {
        showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
      };
    } else if (cmd === 'isStreamingComplete') {
        if (ok) {
          setIsWsSend(false);
          setReceiveMessageListData((currentReceive) => {
            setMessageListData((prev) => [...prev, ...currentReceive]);
            return []; // receiveMessageListData を初期化
          });
        } else {
          setIsWsSend(false);
          showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
        };
    // end
    };
  } finally {
    // 多重送信管理フラグを解除
    setIsWebSocketWaiting(false);
  };
};
// customReceiveLogic △