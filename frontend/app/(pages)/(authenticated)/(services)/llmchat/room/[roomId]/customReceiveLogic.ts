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
import { getMessageList, type MessageListResponseData } from '@/features/api/llmchat';
// components
import { showToast } from '@/app/components/utils';


// type
type CustomReceiveLogicProps = {
  contextValue:              WebSocketCoreContextValue;
  payload:                   ServerMessage;
  roomId:                    string;
  setIsWsSend:               Dispatch<SetStateAction<boolean>>;
  setReceiveMessageListData: Dispatch<SetStateAction<MessageListResponseData>>;
  setMessageListData:        Dispatch<SetStateAction<MessageListResponseData>>;
  setSidebarInsetTitle:      Dispatch<SetStateAction<string>>;
};

// ストリーミングテキストを一時的にためておくバッファとタイマーID
const bufferTime: number                               = 50;
let chunkBuffer:  Record<string, string>               = {};
let timerId:      ReturnType<typeof setTimeout> | null = null;

// customReceiveLogic ▽
export async function customReceiveLogic({
  contextValue,
  payload,
  roomId,
  setIsWsSend,
  setReceiveMessageListData,
  setMessageListData,
  setSidebarInsetTitle, }: CustomReceiveLogicProps): Promise<void> {

  const { setIsWebSocketWaiting }  = contextValue;
  const { cmd, ok, message, data } = payload;

  try {
    // SendUserMessage
    if (cmd === 'SendUserMessage') {
      if (ok) {
        const messageId   = sanitizeDOMPurify(String(data?.messageId   || ''));
        const llmResponse = sanitizeDOMPurify(String(data?.llmResponse || ''));

        // バッファに蓄積
        chunkBuffer[messageId] = (chunkBuffer[messageId] ?? '') + llmResponse;

        // タイマー未起動なら開始: bufferTime 後にまとめて setState
        if (!timerId) {
          timerId = setTimeout(() => {
            setReceiveMessageListData((prev) => {
              // prev に対して chunkBuffer にある未反映テキストをまとめて反映
              const newState = prev.map((msg) => {
                const buffered = chunkBuffer[msg.messageId];
                if (buffered) {
                  return { ...msg, llmResponse: msg.llmResponse + buffered, };
                } else {
                  return msg;
                };
              });
              // バッファ タイマーID のリセット
              chunkBuffer = {};
              timerId     = null;
              return newState;
            });
          }, bufferTime);
        }
      } else {
        showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
      };
    // StartUserMessageProcessing
    } else if (cmd === 'StartUserMessageProcessing') {
      if (ok) {
        const messageId   = sanitizeDOMPurify(String(data?.messageId || ''));
        const userMessage = sanitizeDOMPurify(String(data?.userMessage || ''));
        // setReceiveMessageListDataに同じ messageId が存在すればスキップ
        // 存在しなければオブジェクトを追加して setIsWebSocketWaiting=true セット
        setReceiveMessageListData((prev) => {
          const isExist = prev.some((msg) => msg.messageId === messageId);
          if (isExist) return prev;
          setIsWebSocketWaiting(true);
          return [
            ...prev,
            {
              messageId:   messageId,
              userMessage: userMessage,
              llmResponse: '',
            },
          ];
        });
      } else {
        showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
      };
    // isStreamingComplete
    } else if (cmd === 'isStreamingComplete') {
      if (ok) {
        const messageId   = sanitizeDOMPurify(String(data?.messageId   || ''));
        const userMessage = sanitizeDOMPurify(String(data?.userMessage || ''));
        const llmResponse = sanitizeDOMPurify(String(data?.llmResponse || ''));

        // タイマーを強制停止してバッファがあれば削除 ▽
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        };
        delete chunkBuffer[messageId];
        // タイマーを強制停止してバッファがあれば削除 △

        // setReceiveMessageListData から messageId があれば削除 ▽
        setReceiveMessageListData((prev) => {
          return prev.filter((msg) => msg.messageId !== messageId);
        });
        // setReceiveMessageListData から messageId があれば削除 △

        // setMessageListData への追加 ▽
        setMessageListData((prev) => {
          const isExist = prev.some((msg) => msg.messageId === messageId);
          if (isExist) {
            // すでに同じ messageId がある場合は userMessage, llmResponse を置換
            return prev.map((msg) => {
              if (msg.messageId === messageId) {
                return { ...msg, userMessage, llmResponse };
              };
              return msg;
            });
          } else {
            // なければ新規追加
            return [ ...prev, { messageId, userMessage, llmResponse, }, ];
          };
        });
        // setMessageListData への追加 △
      } else {
        showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
      };
      setIsWsSend(false);
      // 多重送信管理フラグを解除
      setIsWebSocketWaiting(false);
    // ChangeRoomName
    } else if (cmd === 'ChangeRoomName') {
      if (ok) {
        const roomName = sanitizeDOMPurify(String(data?.roomName || ''));
        setSidebarInsetTitle(roomName);
      } else {
        //
      };
    // 共通コマンド ▽
    // Reconnect
    } else if (cmd === 'Reconnect') {
      const [messageResult] = await Promise.all([
        getMessageList(roomId),
      ]);
      if (messageResult?.ok) {
        const InitMessageListData = messageResult.data ?? [];
        setMessageListData(InitMessageListData);
        setReceiveMessageListData([]);
      } else {
        showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
      };
      setIsWsSend(false);
    // Error
    } else if (cmd === 'Error') {
      if (message) {
        showToast('error', sanitizeDOMPurify(String(message)), {position: 'bottom-right', duration: 3000});
      };
      setIsWsSend(false);
      // 多重送信管理フラグを解除
      setIsWebSocketWaiting(false);
    // 共通コマンド △
    // end
    };
  } catch {
    setIsWsSend(false);
    showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
  } finally {
    //
  };
};
// customReceiveLogic △