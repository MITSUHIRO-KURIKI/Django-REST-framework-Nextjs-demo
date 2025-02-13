'use client';

// react
import { type ReactElement } from 'react';
// providers
import {
  WebSocketCoreProvider,
  SpeechTextAzureCoreProvider as SpeechTextCoreProvider, // or SpeechTextGcloudCoreProvider
  VrmCoreProvider,
} from '@/app/providers';
// features
import { vrmChatPath } from '@/features/paths/backend';
// import
import { VrmChatRoomParams } from './page';
// include
import { ClientContext } from './ClientContext';


export function VrmChatRoomContent({ roomId, roomTitle }: VrmChatRoomParams): ReactElement{

  return (
    <>
      <WebSocketCoreProvider WebsocketUrl={vrmChatPath.ws_room} WebsocketId={roomId}>
        <SpeechTextCoreProvider>
          <VrmCoreProvider url = {'/services/vrmchat/vrm/model.vrm'}>
            <ClientContext roomId    = {roomId}
                           roomTitle = {roomTitle}/>
          </VrmCoreProvider>
        </SpeechTextCoreProvider>
      </WebSocketCoreProvider>
    </>
  );
};