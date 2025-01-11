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
import { ResetPasswordConfilmFormInputType } from './schema';

// type
type PasswordResetConfilmRequest = {
  uid:   string;
  token: string;
} & ResetPasswordConfilmFormInputType;
type ResetPasswordConfilmResponse = {
  ok:            boolean;
  status:        number;
  message?:      string;
  toastType?:    string;
  toastMessage?: string;
};

// resetPasswordConfilm
export async function resetPasswordConfilm(params: PasswordResetConfilmRequest): Promise<ResetPasswordConfilmResponse> {
  try {
    const { uid, token, newPassword, reNewPassword, csrfToken } = params;

    // CSRFチェック ▽
    const cookieStore = await cookies();
    const allCookies  = cookieStore.getAll();
    const csrfResult: NextResponse | undefined = csrfValidatorForCookie(allCookies, csrfToken);
    // CSRFチェック △

    // input valid
    if (!uid || !token || !newPassword || !reNewPassword || !csrfResult?.ok) {
      const response: ResetPasswordConfilmResponse = {
        ok:           false,
        status:       400,
        message:      'パスワード再設定に失敗しました',
        toastType:    'error',
        toastMessage: 'パスワード再設定に失敗しました',
      };
      return response;
    };

    const res = await BackendApiClient.post(
      accountsPath.reset_password_confirm,
      {
        uid:             uid,
        token:           token,
        new_password:    newPassword,
        re_new_password: reNewPassword,
      },
      { headers: { 'Content-Type': 'application/json', }},
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const response: ResetPasswordConfilmResponse = {
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
        const response: ResetPasswordConfilmResponse = {
          ok:           false,
          status:       429,
          message:      '時間をおいて再度お試しください',
          toastType:    'error',
          toastMessage: '時間をおいて再度お試しください',
        };
        return response;
      } else {
        const response: ResetPasswordConfilmResponse = {
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
    const response: ResetPasswordConfilmResponse = {
      ok:           false,
      status:       500,
      message:      'パスワード再設定に失敗しました',
      toastType:    'error',
      toastMessage: 'パスワード再設定に失敗しました',
    };
    return response;
  };
};