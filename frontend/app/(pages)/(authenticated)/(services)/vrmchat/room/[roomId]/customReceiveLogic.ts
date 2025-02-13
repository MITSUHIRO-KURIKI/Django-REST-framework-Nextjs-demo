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

// features
import { sanitizeDOMPurify } from '@/features/utils';
import type { WebSocketCoreContextValue, ServerMessage } from '@/app/providers';
// components
import { showToast } from '@/app/components/utils';


export async function customReceiveLogic(
  contextValue: WebSocketCoreContextValue,
  payload:      ServerMessage,
  setReceivedMessages,
  setRecognizedText,
  allrecognizedTextRef,
  textToSpeech,
  setSidebarInsetTitle,): Promise<void> {

  const { setIsWebSocketWaiting } = contextValue;
  const { cmd, ok, data }         = payload;

  try {
    // VRMMessage
    if (cmd === 'VRMMessage') {
      if (ok) {
        const messageText = sanitizeDOMPurify(String(data?.aiMessage || ''));
        
        setRecognizedText([]);
        setReceivedMessages(messageText);
        textToSpeech(messageText);
        allrecognizedTextRef.current = [];
      } else {
        showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
      };
    // ChangeRoomName
    } else if (cmd === 'ChangeRoomName') {
      if (ok) {
        const roomName = sanitizeDOMPurify(String(data?.roomName || ''));
        setSidebarInsetTitle(roomName);
      } else {
        //
      };
    // end
    };
  } finally {
    // 多重送信管理フラグを解除
    setIsWebSocketWaiting(false);
  };
};