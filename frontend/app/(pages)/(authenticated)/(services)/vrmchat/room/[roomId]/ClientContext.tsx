'use client';

// react
import { useState, useEffect, useContext, useRef, type ReactElement } from 'react';
// components
import { showToast } from '@/app/components/utils';
// providers
import {
  WebSocketCoreContext,
  type WebSocketCoreContextValue,
  type ServerMessage,
  SpeechTextGcloudCoreContext,
  type SpeechTextCoreContextValue,
  VrmCoreContext,
  startLipSync,
  type VrmCoreContextValue,
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
  isSpacePressed:   boolean;
  isFirstRender:    boolean;
} & Pick<VrmChatRoomParams,  'roomId'>
  & Pick<WebSocketCoreContextValue,  'isWebSocketWaiting'>
  & Pick<SpeechTextCoreContextValue, 'recognizedText' | 'recognizingText' | 'isStopRecognition' | 'isLoading'>
  & Pick<VrmCoreContextValue,        'width' | 'height' | 'containerRef'>;

// ClientContext ▽
export function ClientContext({ roomId, roomTitle }: VrmChatRoomParams): ReactElement {
  // WebSocketCoreContext first ▽
  const wsContext = useContext(WebSocketCoreContext);
  const { isWebSocketWaiting, handleSendCore, serverMessage } = wsContext as WebSocketCoreContextValue;
  const { cmd, status, ok, message, data } = (serverMessage ?? {}) as ServerMessage;
  // WebSocketCoreContext first △
  // SpeechTextCoreContext first ▽
  const stContext = useContext(SpeechTextGcloudCoreContext);
  const {
    recognizingText,
    recognizedText,
    setRecognizedText,
    allrecognizedTextRef,
    isLoading,
    isStopRecognition,
    isSpeechStreaming,
    speechDataArray,
    speechAnalyser,
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
  const [isSpacePressed, setIsSpacePressed]     = useState<boolean>(false);
  const [isFirstRender, setIsFirstRender]       = useState<boolean>(true); // 初期案内文用

  // 送信 (isStopRecognition 変化で発火)
  useEffect(() => {
    if (!stContext) return;
    // isStopRecognition=true で送信
    if (isStopRecognition) {
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
  // スペースキー状態管理
  // SpeechTextCoreContext で実装するか迷うが
  // 常に状態管理が必要あるか不明なので子で管理する
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(true);
        // 初期案内文用
        setIsFirstRender(false);
      };
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      };
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup',   handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup',   handleKeyUp);
    };
  }, []);

  // Sidebar タイトルセット ▽
  useEffect(() => {
    setSidebarInsetTitle(roomTitle);
  }, [roomTitle]);
  // Sidebar タイトルセット △

  // WebSocketCoreContext last ▽
  if (!wsContext || !stContext || !vrmContext) {
    showToast('error', 'error', { position: 'bottom-right', duration: 3000 });
    return <p>not available</p>;
  };
  // WebSocketCoreContext last △
  return (
    <ClientUI
      roomId             = {roomId}
      recognizedText     = {recognizedText}
      recognizingText    = {recognizingText}
      receivedMessages   = {receivedMessages}
      isStopRecognition  = {isStopRecognition}
      width              = {width}
      height             = {height}
      containerRef       = {containerRef}
      isWebSocketWaiting = {isWebSocketWaiting}
      isLoading          = {isLoading}
      isSpacePressed     = {isSpacePressed}
      isFirstRender      = {isFirstRender} />
  );
}
// ClientContext △