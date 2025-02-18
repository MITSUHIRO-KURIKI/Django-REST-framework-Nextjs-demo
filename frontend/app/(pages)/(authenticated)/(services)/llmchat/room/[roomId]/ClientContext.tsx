'use client';

// react
import {
  useState,
  useEffect,
  useContext,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// providers
import {
  // WebSocket
  WebSocketCoreContext,
  type WebSocketCoreContextValue,
  type ServerMessage,
  // Sidebar
  SidebarContext,
  type SidebarContextValue,
} from '@/app/providers';
// customReceiveLogic
import { customReceiveLogic } from './customReceiveLogic';
// features
import { generateUUIDHex } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// include
import { ClientUI } from './ui/ClientUI';
// type
import { type MessageListResponseData } from '@/features/api/llmchat';


// type
export type ClientUIProps = {
  roomId:                 string;
  messageListData:        MessageListResponseData;
  receiveMessageListData: MessageListResponseData;
  setSendMessages:        Dispatch<SetStateAction<string>>;
  isWsSend:               boolean;
  setIsWsSend:            Dispatch<SetStateAction<boolean>>;
  userIconData:           string;
  roomAiIconData:         string;
} & Pick<WebSocketCoreContextValue, 'isWebSocketWaiting'>;

// ClientContext ▽
export function ClientContext({ roomId, roomTitle, roomAiIconData, InitMessageListData, userIconData }): ReactElement {
  // WebSocketCoreContext first ▽
  const wsContext                                             = useContext(WebSocketCoreContext);
  const { isWebSocketWaiting, handleSendCore, serverMessage } = wsContext as WebSocketCoreContextValue;
  const { cmd, status, ok, message, data }                    = (serverMessage ?? {}) as ServerMessage;
  // WebSocketCoreContext first △
  // SidebarContext first ▽
  const sbarContext = useContext(SidebarContext);
  const {
    setSidebarInsetTitle,
    setSidebarInsetSubTitle,
  } = sbarContext as SidebarContextValue;
  // SidebarContext first △

  // Local State
  const [isWsSend, setIsWsSend]                             = useState<boolean>(false);
  const [sendMessages, setSendMessages]                     = useState<string>('');
  const [receiveMessageListData, setReceiveMessageListData] = useState<MessageListResponseData>([]);
  const [messageListData, setMessageListData]               = useState<MessageListResponseData>(InitMessageListData);

  // 送信 (isStopRecognition 変化で発火)
  useEffect(() => {
    // isStopRecognition=true で送信
    if (isWsSend) {
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
      handleSendCore(
        'SendUserMessage',
        {
          messageId: messageId,
          message:   sendMessages,
        }
      );
    };
  }, [isWsSend]);
  // WebSocket 受信
  useEffect(() => {
    // serverMessage が来た際のみ独自ロジックで処理を行う
    if (!wsContext || !serverMessage) return;
    void customReceiveLogic({
      contextValue: wsContext,
      payload:      { cmd, status, ok, message, data },
      roomId,
      setIsWsSend,
      setReceiveMessageListData,
      setMessageListData,
      setSidebarInsetTitle,
    });
  }, [serverMessage]);

  // Sidebar タイトルセット ▽
  useEffect(() => {
    setSidebarInsetTitle(roomTitle);
    setSidebarInsetSubTitle('LLM Chat');
  }, [roomTitle, setSidebarInsetTitle, setSidebarInsetSubTitle]);
  // Sidebar タイトルセット △

  // WebSocketCoreContext last ▽
  if (!wsContext) {
    showToast('error', 'error', { position: 'bottom-right', duration: 3000 });
    return <p className='select-none text-xs font-thin text-muted-foreground'>Sorry, not available</p>;
  };
  // WebSocketCoreContext last △
  return (
    <ClientUI
      roomId                 = {roomId}
      messageListData        = {messageListData}
      receiveMessageListData = {receiveMessageListData}
      isWebSocketWaiting     = {isWebSocketWaiting}
      setSendMessages        = {setSendMessages}
      isWsSend               = {isWsSend}
      setIsWsSend            = {setIsWsSend}
      userIconData           = {userIconData}
      roomAiIconData         = {roomAiIconData} />
  );
};
// ClientContext △