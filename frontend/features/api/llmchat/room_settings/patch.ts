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
// type
import type {
  RoomSettingsRoomNameChangeInputType,
} from './schema';
import type { RoomSettingsResponseData } from './type.d';
import type { DefaultResponse } from '@/features/api';

// type
type PatchRoomSettingsRequest = {
  roomId:   string;
  formData: FormData;
};
type PatchRoomSettingsRoomNameChangeRequest = {
  roomId:   string;
  formData: RoomSettingsRoomNameChangeInputType;
};
type PatchRoomSettingsResponse = DefaultResponse & {
  data?: RoomSettingsResponseData;
};
  
// patchRoomSettings
export async function patchRoomSettings(params: PatchRoomSettingsRequest): Promise<PatchRoomSettingsResponse> {

  const responseDefaultErrMsg = '更新に失敗しました';

  try {
    const { roomId, formData }    = params;
    const session: Session | null = await getAuthSession();

    const res = await BackendApiClient.patch(
      llmChatPath.room_settings+roomId,
      formData,
      { headers: {
        'Content-Type':  'multipart/form-data',
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      }}
    );

    //  Axios は 2xx 以外で catch に飛ぶ
    const data:RoomSettingsResponseData = res.data;
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

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       429,
          message:      '時間をおいて再度お試しください',
          toastType:    'error',
          toastMessage: '時間をおいて再度お試しください',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: PatchRoomSettingsResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: PatchRoomSettingsResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};

// patchRoomSettingsRoomNameChange
export async function patchRoomSettingsRoomNameChange(params: PatchRoomSettingsRoomNameChangeRequest): Promise<PatchRoomSettingsResponse> {

  const responseDefaultErrMsg = '更新に失敗しました';

  try {
    const { roomId, formData }    = params;
    const session: Session | null = await getAuthSession();

    const res = await BackendApiClient.patch(
      llmChatPath.room_settings+roomId,
      formData,
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

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       429,
          message:      '時間をおいて再度お試しください',
          toastType:    'error',
          toastMessage: '時間をおいて再度お試しください',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: PatchRoomSettingsResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: PatchRoomSettingsResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};