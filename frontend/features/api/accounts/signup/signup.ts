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
import { SignupFormInputType } from './schema';

// type
type SignupResponse = {
  ok:            boolean;
  status:        number;
  message?:      string;
  toastType?:    string;
  toastMessage?: string;
};

// signup
export async function signup(params: SignupFormInputType): Promise<SignupResponse> {
  try {
    const { email, password, rePassword, csrfToken } = params;

    // CSRFチェック ▽
    const cookieStore = await cookies();
    const allCookies  = cookieStore.getAll();
    const csrfResult: NextResponse | undefined = csrfValidatorForCookie(allCookies, csrfToken);
    // CSRFチェック △

    // input valid
    if (!email || !csrfResult?.ok) {
      const response: SignupResponse = {
        ok:           false,
        status:       400,
        message:      'サインアップに失敗しました',
        toastType:    'error',
        toastMessage: 'サインアップに失敗しました',
      };
      return response;
    };

    const res = await BackendApiClient.post(
      accountsPath.root,
      {
        email:       email,
        password:    password,
        re_password: rePassword,
      },
      { headers: { 'Content-Type': 'application/json', }},
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const response: SignupResponse = {
      ok:           true,
      status:       res.status,
      message:      '認証メールを送信しました',
      toastType:    'success',
      toastMessage: '認証メールを送信しました',
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 429) {
        const response: SignupResponse = {
          ok:           false,
          status:       429,
          message:      '時間をおいて再度お試しください',
          toastType:    'error',
          toastMessage: '時間をおいて再度お試しください',
        };
        return response;
      } else {
        const response: SignupResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      'サインアップに失敗しました',
          toastType:    'error',
          toastMessage: 'サインアップに失敗しました',
        };
        return response;
      };
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: SignupResponse = {
      ok:           false,
      status:       500,
      message:      'サインアップに失敗しました',
      toastType:    'error',
      toastMessage: 'サインアップに失敗しました',
    };
    return response;
  };
};