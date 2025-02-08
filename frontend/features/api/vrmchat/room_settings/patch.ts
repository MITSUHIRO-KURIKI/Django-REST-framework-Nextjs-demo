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
// import
import type {
  RoomSettingsFormInputType,
  RoomSettingsRoomNameChangeInputType,
} from './schema';
import type { RoomSettingsResponseData } from './type.d';
// type
import { DefaultResponse } from '@/features/api';

// type
type PatchRoomSettingsRequest = {
  roomId:   string;
  sendData: RoomSettingsFormInputType;
};
type PatchRoomSettingsRoomNameChangeRequest = {
  roomId:   string;
  sendData: RoomSettingsRoomNameChangeInputType;
};
type PatchRoomSettingsResponse = DefaultResponse & {
  data?: RoomSettingsResponseData[];
};
  
// patchRoomSettings
export async function patchRoomSettings(params: PatchRoomSettingsRequest): Promise<PatchRoomSettingsResponse> {
  try {
      const { roomId, sendData }    = params;
      const session: Session | null = await getAuthSession();

      const res = await BackendApiClient.patch(
        vrmChatPath.room_settings+roomId,
        sendData,
        { headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        }}
      );

      //  Axios は 2xx 以外で catch に飛ぶ
      const data:RoomSettingsResponseData[] = res.data;
      const response: PatchRoomSettingsResponse = {
        ok:           true,
        status:       res.status,
        data:         data,
        message:      '更新しました',
        toastType:    'success',
        toastMessage: '更新しました',
      };
      return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       429,
          message:      '更新に失敗しました',
          toastType:    'error',
          toastMessage: '更新に失敗しました',
        };
        return response;
      } else {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      '更新に失敗しました',
          toastType:    'error',
          toastMessage: '更新に失敗しました',
        };
        return response;
      };
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: PatchRoomSettingsResponse = {
      ok:           false,
      status:       500,
      message:      '更新に失敗しました',
      toastType:    'error',
      toastMessage: '更新に失敗しました',
    };
    return response;
  };
};

// patchRoomSettingsRoomNameChange
export async function patchRoomSettingsRoomNameChange(params: PatchRoomSettingsRoomNameChangeRequest): Promise<PatchRoomSettingsResponse> {
  try {
      const { roomId, sendData }    = params;
      const session: Session | null = await getAuthSession();

      const res = await BackendApiClient.patch(
        vrmChatPath.room_settings+roomId,
        sendData,
        { headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        }}
      );

      //  Axios は 2xx 以外で catch に飛ぶ
      const response: PatchRoomSettingsResponse = {
        ok:           true,
        status:       res.status,
      };
      return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       429,
          message:      '更新に失敗しました',
          toastType:    'error',
          toastMessage: '更新に失敗しました',
        };
        return response;
      } else if (status === 400 && error.response.data) {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      error.response.data,
          toastType:    'error',
          toastMessage: '更新に失敗しました',
        };
        return response;
      } else {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      '更新に失敗しました',
          toastType:    'error',
          toastMessage: '更新に失敗しました',
        };
        return response;
      };
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: PatchRoomSettingsResponse = {
      ok:           false,
      status:       500,
      message:      '更新に失敗しました',
      toastType:    'error',
      toastMessage: '更新に失敗しました',
    };
    return response;
  };
};