'use server';

// next
import { NextResponse } from 'next/server';
// lib
import axios from 'axios';
// paths
import { accountsPath } from '@/features/paths/backend';
// features
import { BackendApiClient } from '@/features/apiClients';
import { csrfValidatorForCookie } from '@/features/utils';
import { cookies } from 'next/headers';
// type
import { DefaultResponse } from '@/features/api';

// type
export type ActivationParams = {
  uid:   string;
  token: string;
};
type ActivationRequest = ActivationParams & {
  csrfToken: string;
};


// activation
export async function activation(params: ActivationRequest): Promise<DefaultResponse> {
  try{
    const { uid, token, csrfToken } = params;

    // CSRFチェック ▽
    const cookieStore = await cookies();
    const allCookies  = cookieStore.getAll();
    const csrfResult: NextResponse | undefined = csrfValidatorForCookie(allCookies, csrfToken);
    // CSRFチェック △

    // input valid
    if (!uid || !token || !csrfResult?.ok) {
      const response: DefaultResponse = {
        ok:           false,
        status:       400,
        message:      '認証エラー',
        toastType:    'error',
        toastMessage: '認証エラー',
      };
      return response;
    };

    const res = await BackendApiClient.post(
      accountsPath.activation,
      { uid:   uid,
        token: token,
      },
      { headers: { 'Content-Type': 'application/json', }},
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const response: DefaultResponse = {
      ok:           true,
      status:       res.status,
      message:      '本登録が完了しました',
      toastType:    'success',
      toastMessage: '本登録が完了しました',
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: DefaultResponse = {
          ok:           false,
          status:       429,
          message:      '時間をおいて再度お試しください',
          toastType:    'error',
          toastMessage: '時間をおいて再度お試しください',
        };
        return response;
      } else {
        const response: DefaultResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      '認証エラー',
          toastType:    'error',
          toastMessage: '認証エラー',
        };
        return response;
      };
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: DefaultResponse = {
      ok:           false,
      status:       500,
      message:      '認証エラー',
      toastType:    'error',
      toastMessage: '認証エラー',
    };
    return response;
  };
};