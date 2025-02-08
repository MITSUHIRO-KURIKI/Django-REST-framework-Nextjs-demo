'use server';

// next-auth
import { type Session } from 'next-auth';
// lib
import axios from 'axios';
// paths
import { vrmChatPath } from '@/features/paths/backend';
// features
import { getAuthSession } from '@/features/nextauth';
import { BackendApiClient } from '@/features/apiClients';
// type
import { DefaultResponse } from '@/features/api';


// createRoom
export async function deleteRoom(roomId: string): Promise<DefaultResponse> {
  try {
      const session: Session | null = await getAuthSession();
      const res = await BackendApiClient.delete(
        vrmChatPath.room_delete+roomId,
        { headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        }}
      );
      //  Axios は 2xx 以外で catch に飛ぶ
      const response: DefaultResponse = {
        ok:     true,
        status: res.status,
      };
      return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: DefaultResponse = {
          ok:           false,
          status:       429,
          message:      'データ取得に失敗しました',
          toastType:    'error',
          toastMessage: 'データ取得に失敗しました',
        };
        return response;
      } else {
        const response: DefaultResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      'データ取得に失敗しました',
          toastType:    'error',
          toastMessage: 'データ取得に失敗しました',
        };
        return response;
      };
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: DefaultResponse = {
      ok:           false,
      status:       500,
      message:      'データ取得に失敗しました',
      toastType:    'error',
      toastMessage: 'データ取得に失敗しました',
    };
    return response;
  };
};