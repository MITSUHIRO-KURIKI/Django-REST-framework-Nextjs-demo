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
import { parseResponseData } from '@/features/utils';
// import
import type { RoomSettingsResponseData, RoomSettingsRoomNameListResponseItem } from './type.d';
import type { SubItem } from '@/app/components/ui/Navigation/data';
// type
import { DefaultResponse } from '@/features/api';

// type
type GetRoomSettingsResponse = DefaultResponse & {
  data?: RoomSettingsResponseData;
};
type GetRoomSettingsRoomNameResponse = DefaultResponse & {
  data?: string;
};
type GetRoomSettingsRoomNameListResponse = DefaultResponse & {
  data?: SubItem[];
};

// getRoomSettings
export async function getRoomSettings(roomId: string): Promise<GetRoomSettingsResponse> {
  try {
      const session: Session | null = await getAuthSession();
      const res = await BackendApiClient.get(
        vrmChatPath.room_settings+roomId,
        { headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        }}
      );
      //  Axios は 2xx 以外で catch に飛ぶ
      const data:RoomSettingsResponseData = res.data;
      const response: GetRoomSettingsResponse = {
        ok:     true,
        status: res.status,
        data:   data,
      };
      return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: GetRoomSettingsResponse = {
          ok:           false,
          status:       429,
          message:      'データ取得に失敗しました',
          toastType:    'error',
          toastMessage: 'データ取得に失敗しました',
        };
        return response;
      } else {
        const response: GetRoomSettingsResponse = {
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
    const response: GetRoomSettingsResponse = {
      ok:           false,
      status:       500,
      message:      'データ取得に失敗しました',
      toastType:    'error',
      toastMessage: 'データ取得に失敗しました',
    };
    return response;
  };
};

// getRoomSettingsRoomNameList
export async function getRoomSettingsRoomName(roomId: string): Promise<GetRoomSettingsRoomNameResponse> {
  try {
      const session: Session | null = await getAuthSession();
      const res = await BackendApiClient.get(
        vrmChatPath.room_settings_room_name+roomId,
        { headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        }}
      );
      //  Axios は 2xx 以外で catch に飛ぶ
      const data:RoomSettingsRoomNameListResponseItem = res.data;
      const response: GetRoomSettingsRoomNameResponse = {
        ok:     true,
        status: res.status,
        data:   data.roomName,
      };
      return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: GetRoomSettingsRoomNameResponse = {
          ok:           false,
          status:       429,
          message:      'データ取得に失敗しました',
          toastType:    'error',
          toastMessage: 'データ取得に失敗しました',
        };
        return response;
      } else {
        const response: GetRoomSettingsRoomNameResponse = {
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
    const response: GetRoomSettingsRoomNameResponse = {
      ok:           false,
      status:       500,
      message:      'データ取得に失敗しました',
      toastType:    'error',
      toastMessage: 'データ取得に失敗しました',
    };
    return response;
  };
};

// getRoomSettingsRoomNameList
export async function getRoomSettingsRoomNameList(page: number, size:number): Promise<GetRoomSettingsRoomNameListResponse> {
  try {
      const session: Session | null = await getAuthSession();
      // 途中フロントでサブメニューを操作しているので全量を取得してフロントに反映する
      const res = await BackendApiClient.get(
        vrmChatPath.room_settings_room_name_list+'?page=1&size='+(page*size)+'&ordering_desc_field_name=id',
        { headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        }}
      );
      //  Axios は 2xx 以外で catch に飛ぶ
      const items = parseResponseData<RoomSettingsRoomNameListResponseItem>(res);
      const cleanData:SubItem[] = items.map((item) => ({
        key:   item.roomId_RoomId,
        label: item.roomName,
        href:  item.roomId_RoomId,
      }));
      const response: GetRoomSettingsRoomNameListResponse = {
        ok:     true,
        status: res.status,
        data:   cleanData,
      };
      return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: GetRoomSettingsRoomNameListResponse = {
          ok:           false,
          status:       429,
          message:      'データ取得に失敗しました',
          toastType:    'error',
          toastMessage: 'データ取得に失敗しました',
        };
        return response;
      } else {
        const response: GetRoomSettingsRoomNameListResponse = {
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
    const response: GetRoomSettingsRoomNameListResponse = {
      ok:           false,
      status:       500,
      message:      'データ取得に失敗しました',
      toastType:    'error',
      toastMessage: 'データ取得に失敗しました',
    };
    return response;
  };
};