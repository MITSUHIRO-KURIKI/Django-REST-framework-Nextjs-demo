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
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// providers
import {
  WebSocketCoreContext,
  type WebSocketCoreContextValue,
} from '@/app/providers';
import {
  SidebarContext,
  type SidebarContextValue,
} from '@/app/components/ui/Navigation';
// hooks
import { useWsMessageSender, useWsMessageReceiver } from './hooks';
// features
import { UrlToString } from '@/features/utils';
// components
import { OverlaySpinner } from '@/app/components/utils';
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
  const wsContext = useContext(WebSocketCoreContext);
  const {
    socketRef,
    isWebSocketWaiting,
    handleSendCore,
    serverMessage,
  } = wsContext as WebSocketCoreContextValue;
  // WebSocketCoreContext first △
  // SidebarContext first ▽
  const sbarContext = useContext(SidebarContext);
  const {
    setSidebarInsetTitle,
    setSidebarInsetSubTitle,
    setSidebarInsetSubTitleUrl,
  } = sbarContext as SidebarContextValue || {};
  // SidebarContext first △

  // Local State
  const [isWsSend, setIsWsSend]                             = useState<boolean>(false);
  const [sendMessages, setSendMessages]                     = useState<string>('');
  const [receiveMessageListData, setReceiveMessageListData] = useState<MessageListResponseData>([]);
  const [messageListData, setMessageListData]               = useState<MessageListResponseData>(InitMessageListData);

  // WebSocket 送信
  useWsMessageSender({
    isWsSend,
    setIsWsSend,
    sendMessages,
    setReceiveMessageListData,
    handleSendCore,
  });
  // WebSocket 受信
  useWsMessageReceiver({
    wsContext,
    serverMessage,
    roomId,
    setIsWsSend,
    setReceiveMessageListData,
    setMessageListData,
    setSidebarInsetTitle,
  });

  // Sidebar タイトルセット ▽
  useEffect(() => {
    if (setSidebarInsetTitle)       setSidebarInsetTitle(roomTitle);
    if (setSidebarInsetSubTitle)    setSidebarInsetSubTitle('LLM Chat');
    if (setSidebarInsetSubTitleUrl) setSidebarInsetSubTitleUrl(UrlToString(pagesPath.servicesPath.llmChat.$url()));
  }, [
    roomTitle,
    setSidebarInsetTitle,
    setSidebarInsetSubTitle,
    setSidebarInsetSubTitleUrl,
  ]);
  // Sidebar タイトルセット △

  return (
    <>
      <OverlaySpinner isActivate={!(socketRef.current?.readyState === WebSocket.OPEN)} />
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
    </>
  );
};
// ClientContext △