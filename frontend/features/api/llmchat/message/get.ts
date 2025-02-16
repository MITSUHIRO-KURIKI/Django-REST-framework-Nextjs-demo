'use server';

// next-auth
import { type Session } from 'next-auth';
// lib
import axios from 'axios';
// paths
import { llmChatPath } from '@/features/paths/backend';
// features
import { getAuthSession } from '@/features/nextauth';
import { BackendApiClient } from '@/features/apiClients';
import { parseResponseData } from '@/features/utils';
// type
import type { MessageListResponseItem, MessageListResponseData } from './type.d';
import type { DefaultResponse } from '@/features/api';

// type
type GetMessageListResponse = DefaultResponse & {
  data?: MessageListResponseData;
};

// getMessageList
export async function getMessageList(roomId: string): Promise<GetMessageListResponse> {

  const responseDefaultErrMsg = 'データ取得に失敗しました';

  try {
    const session: Session | null = await getAuthSession();
    // 途中フロントでサブメニューを操作しているので全量を取得してフロントに反映する
    const res = await BackendApiClient.get(
      // 9999 件を上限にする
      llmChatPath.message+roomId+'?page=1&size=9999',
      { headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      }}
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    
    // データの成形 ▽
    const items                             = parseResponseData<MessageListResponseItem>(res);
    const cleanData:MessageListResponseData = items.map((item) => ({
      messageId:   item.messageId,
      userMessage: item.userMessage,
      llmResponse: item.llmResponse,
    }));
    // データの成形 △
    const response: GetMessageListResponse = {
      ok:     true,
      status: res.status,
      data:   cleanData,
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: GetMessageListResponse = {
          ok:           false,
          status:       429,
          message:      '時間をおいて再度お試しください',
          toastType:    'error',
          toastMessage: '時間をおいて再度お試しください',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: GetMessageListResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: GetMessageListResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: GetMessageListResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};