'use client';

// react
import { useState, useEffect, useContext, useRef, type ReactElement } from 'react';
// components
import { showToast } from '@/app/components/utils';
// providers
import {
  // WebSocket
  WebSocketCoreContext,
  type WebSocketCoreContextValue,
  type ServerMessage,
  // SpeechText
  SpeechTextAzureCoreContext as SpeechTextCoreContext, // or SpeechTextGcloudCoreContext
  type SpeechTextCoreContextValue,
  // Vrm
  VrmCoreContext,
  startLipSync,
  type VrmCoreContextValue,
  // Sidebar
  SidebarContext,
  type SidebarContextValue,
} from '@/app/providers';
import { customReceiveLogic } from './customReceiveLogic';
// import
import { VrmChatRoomParams } from './page';
// include
import { ClientUI } from './ui/ClientUI';


// type
export type ClientUIProps = {
  receivedMessages: string;
} & Pick<VrmChatRoomParams,          'roomId'>
  & Pick<WebSocketCoreContextValue,  'isWebSocketWaiting'>
  & Pick<SpeechTextCoreContextValue, 'recognizingText' | 'recognizedText' | 'isLoading' | 'isStopRecognition' | 'isRecognizing' | 'toggleRecognition'>
  & Pick<VrmCoreContextValue,        'width' | 'height' | 'containerRef'>;

// ClientContext ▽
export function ClientContext({ roomId, roomTitle }: VrmChatRoomParams): ReactElement {
  // WebSocketCoreContext first ▽
  const wsContext = useContext(WebSocketCoreContext);
  const { isWebSocketWaiting, handleSendCore, serverMessage } = wsContext as WebSocketCoreContextValue;
  const { cmd, status, ok, message, data } = (serverMessage ?? {}) as ServerMessage;
  // WebSocketCoreContext first △
  // SpeechTextCoreContext first ▽
  const stContext = useContext(SpeechTextCoreContext);
  const {
    recognizingText,
    recognizedText,
    setRecognizedText,
    allrecognizedTextRef,
    isSpeechStreaming,
    speechDataArray,
    speechAnalyser,
    isLoading,
    isRecognizing,
    isStopRecognition,
    toggleRecognition,
    textToSpeech,
  } = stContext as SpeechTextCoreContextValue;
  // SpeechTextCoreContext first △
  // VrmCoreContext first ▽
  const vrmContext = useContext(VrmCoreContext);
  const {
    currentVrm,
    width,
    height,
    containerRef,
  } = vrmContext as VrmCoreContextValue;
  // VrmCoreContext first △
  // SidebarContext first ▽
  const sbarContext = useContext(SidebarContext);
  const {
    setSidebarInsetTitle,
  } = sbarContext as SidebarContextValue;
  // SidebarContext first △
  
  // Local State
  const [receivedMessages, setReceivedMessages] = useState<string>('');

  // 送信 (isStopRecognition 変化で発火)
  useEffect(() => {
    if (!stContext) return;
    // isStopRecognition=true で送信
    if (isStopRecognition) {
      // 受信メッセージの初期化
      setReceivedMessages('');
      // 送信
      handleSendCore(
        'VRMMessage',
        {
          message: allrecognizedTextRef.current.join(''),
        }
      );
    };
  }, [isStopRecognition]);
  // 受信
  useEffect(() => {
    // serverMessage が来た際のみ独自ロジックで処理を行う
    if (!wsContext || !serverMessage) return;
    customReceiveLogic(
      wsContext, { cmd, status, ok, message, data },
      setReceivedMessages,
      setRecognizedText,
      allrecognizedTextRef,
      textToSpeech,
      setSidebarInsetTitle,);
  }, [serverMessage, cmd, status, ok, message, data]);
  // VRM リップシンク
  const stopLipSyncRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (isSpeechStreaming && currentVrm && speechAnalyser && speechDataArray) {
      // stopLipSyncRef.current(); // 前回のループが残っていたら念の為止める
      stopLipSyncRef.current = startLipSync(currentVrm, speechAnalyser, speechDataArray);
    } else {
      stopLipSyncRef.current(); // 停止
    };
  }, [isSpeechStreaming, currentVrm, startLipSync]);

  // Sidebar タイトルセット ▽
  useEffect(() => {
    setSidebarInsetTitle(roomTitle);
  }, [roomTitle]);
  // Sidebar タイトルセット △

  // WebSocketCoreContext last ▽
  if (!wsContext || !stContext || !vrmContext) {
    showToast('error', 'error', { position: 'bottom-right', duration: 3000 });
    return <p className='text-xs font-thin text-muted-foreground select-none'>Sorry, not available</p>;
  };
  // WebSocketCoreContext last △

  return (
    <ClientUI
      roomId             = {roomId}
      isWebSocketWaiting = {isWebSocketWaiting}
      recognizedText     = {recognizedText}
      recognizingText    = {recognizingText}
      receivedMessages   = {receivedMessages}
      isLoading          = {isLoading}
      isRecognizing      = {isRecognizing}
      isStopRecognition  = {isStopRecognition}
      toggleRecognition  = {toggleRecognition}
      width              = {width}
      height             = {height}
      containerRef       = {containerRef} />
  );
};
// ClientContext △