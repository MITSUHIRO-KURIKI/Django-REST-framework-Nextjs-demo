'use server';

// next
import { redirect } from 'next/navigation';
// react
import { Suspense, type ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { getRoomSettingsRoomInitData, getMessageList, type MessageListResponseData } from '@/features/api/llmchat';
import { getUserProfile } from '@/features/api/user_properties';
import { UrlToString } from '@/features/utils';
// import
import Loading from '@/app/loading';
// include
import { LlmChatRoomContent } from './LlmChatRoomContent';


// https://github.com/vercel/next.js/discussions/71997#discussioncomment-11531389
export type LlmChatRoomParams = {
    roomId:              string;
    roomTitle:           string;
    roomAiIconData:      string;
    InitMessageListData: MessageListResponseData;
    userIconData:        string;
};
type PageProps = {
    params: Promise<LlmChatRoomParams>;
};


// LlmChatRoomPage
export default async function LlmChatRoomPage(props: PageProps): Promise<ReactElement>{

  const { roomId } = await props.params;

  // InitData ▽
  // ルームタイトルおよび認証 (権限や未知のroomIdならここで弾く)
  const [roomResult, messageResult, userProfileResult] = await Promise.all([
    getRoomSettingsRoomInitData(roomId),
    getMessageList(roomId),
    getUserProfile(),
  ]);
  if (!roomResult?.ok || !messageResult?.ok || !userProfileResult?.ok) {
    redirect(UrlToString(pagesPath.servicesPath.llmChat.$url({query:{errmsg: 'notfound'}})));
  };
  const roomTitle           = roomResult.data?.roomName ?? '';
  const roomAiIconData      = roomResult.data?.aiIcon ?? '';
  const InitMessageListData = messageResult.data ?? [];
  const userIconData        = userProfileResult.data?.userIcon ?? '';
  // InitData △

  return (
    <Suspense fallback={<Loading />}>
      <LlmChatRoomContent roomId              = {roomId}
                          roomTitle           = {roomTitle}
                          roomAiIconData      = {roomAiIconData}
                          InitMessageListData = {InitMessageListData}
                          userIconData        = {userIconData} />
    </Suspense>
  );
};