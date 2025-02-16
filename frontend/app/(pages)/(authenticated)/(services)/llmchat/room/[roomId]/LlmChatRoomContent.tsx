'use client';

// react
import { type ReactElement } from 'react';
// providers
import {
  WebSocketCoreProvider,
} from '@/app/providers';
// features
import { llmChatPath } from '@/features/paths/backend';
// import
import { LlmChatRoomParams } from './page';
// include
import { ClientContext } from './ClientContext';


// LlmChatRoomContent
export function LlmChatRoomContent({ roomId, roomTitle, roomAiIconData, InitMessageListData, userIconData }: LlmChatRoomParams): ReactElement{

  return (
    <>
      <WebSocketCoreProvider WebsocketUrl={llmChatPath.ws_room} WebsocketId={roomId}>
        <ClientContext roomId              = {roomId}
                       roomTitle           = {roomTitle}
                       roomAiIconData      = {roomAiIconData}
                       InitMessageListData = {InitMessageListData}
                       userIconData        = {userIconData} />
      </WebSocketCoreProvider>
    </>
  );
};