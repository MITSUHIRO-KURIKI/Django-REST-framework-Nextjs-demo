'use client';

// react
import {
  useState,
  useEffect,
  useRef,
  type ReactElement,
} from 'react';
// include
import { RoomHeader } from './Header';
import { MessageHistory, MessageReceive } from './Message';
// type
import type { ClientUIProps } from '../ClientContext';
import type { MessageListResponseItem, MessageListResponseData } from '@/features/api/llmchat';


// type
export type MessageProps = {
  messageItem?:     MessageListResponseItem,
  messageListData?: MessageListResponseData,
  userIconData:     string,
  roomAiIconUrl:    string,
};

// ClientUI
export function ClientUI({
  roomId,
  messageListData,
  receiveMessageListData,
  isWebSocketWaiting,
  setSendMessages,
  isWsSend,
  setIsWsSend,
  userIconData,
  roomAiIconData, }: ClientUIProps): ReactElement {

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    };
  }, [receiveMessageListData]);

  // roomAiIconUrl
  // - null の時はフロントのデフォルト画像を表示
  const aiIconUrl = (roomAiIconData && process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL)
                      ? (new URL(process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL).origin as string) + roomAiIconData
                      : '/app/llmchat/ai_icon/default/ai.png';
  const [roomAiIconUrl, setRoomAiIconUrl] = useState<string>(aiIconUrl);

  return (
    <div className='pb-24'>

      {/* 入力含むヘッダー */}
      <RoomHeader roomId             = {roomId}
                  isWebSocketWaiting = {isWebSocketWaiting}
                  setSendMessages    = {setSendMessages}
                  isWsSend           = {isWsSend}
                  setIsWsSend        = {setIsWsSend}
                  roomAiIconUrl      = {roomAiIconUrl}
                  setRoomAiIconUrl   = {setRoomAiIconUrl} />

      {/* メッセージメイン */}
      <div className='flex flex-col gap-2 px-2'>
        <MessageHistory messageListData = {messageListData}
                        userIconData    = {userIconData}
                        roomAiIconUrl   = {roomAiIconUrl} />
        <MessageReceive messageListData = {receiveMessageListData}
                        userIconData    = {userIconData}
                        roomAiIconUrl   = {roomAiIconUrl} />
        {/* スクロール用のダミー要素 */}
        <div ref={endRef} />
      </div>

    </div>
  );
};