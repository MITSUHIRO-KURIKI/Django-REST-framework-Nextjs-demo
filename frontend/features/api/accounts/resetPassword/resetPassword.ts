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
// import
import { PasswordResetFormInputType } from './schema';


// type
type ResetPasswordResponse = {
  ok:            boolean;
  status:        number;
  message?:      string;
  toastType?:    string;
  toastMessage?: string;
};

// resetPassword
export async function resetPassword(params: PasswordResetFormInputType): Promise<ResetPasswordResponse> {
  try {
    const { email, csrfToken } = params;

    // CSRFチェック ▽
    const cookieStore = await cookies();
    const allCookies  = cookieStore.getAll();
    const csrfResult: NextResponse | undefined = csrfValidatorForCookie(allCookies, csrfToken);
    // CSRFチェック △

    // input valid
    if (!email || !csrfResult?.ok) {
      const response: ResetPasswordResponse = {
        ok:           false,
        status:       400,
        message:      'パスワード再設定に失敗しました',
        toastType:    'error',
        toastMessage: 'パスワード再設定に失敗しました',
      };
      return response;
    };

    const res = await BackendApiClient.post(
      accountsPath.reset_password,
      { email: email },
      { headers: { 'Content-Type': 'application/json', }},
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const response: ResetPasswordResponse = {
      ok:           true,
      status:       res.status,
      message:      '再設定用のメールを送信しました',
      toastType:    'success',
      toastMessage: '再設定用のメールを送信しました',
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: ResetPasswordResponse = {
          ok:           false,
          status:       429,
          message:      '時間をおいて再度お試しください',
          toastType:    'error',
          toastMessage: '時間をおいて再度お試しください',
        };
        return response;
      } else {
        const response: ResetPasswordResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      'パスワード再設定に失敗しました',
          toastType:    'error',
          toastMessage: 'パスワード再設定に失敗しました',
        };
        return response;
      };
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: ResetPasswordResponse = {
      ok:           false,
      status:       500,
      message:      'パスワード再設定に失敗しました',
      toastType:    'error',
      toastMessage: 'パスワード再設定に失敗しました',
    };
    return response;
  };
};