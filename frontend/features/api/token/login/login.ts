// next-auth
import { signIn, type SignInResponse } from 'next-auth/react';
// type
import { type LoginFormInputType } from './schema';
import type { DefaultResponse } from '@/features/api';

// type
type LoginRequest = {
  formData:     LoginFormInputType;
  callbackUrl?: string;
};
type LoginResponse = Omit<SignInResponse, 'error'>
                     & DefaultResponse;

// login ▽
export async function login({ formData, callbackUrl }: LoginRequest): Promise<LoginResponse> {

  const responseDefaultErrMsg = 'ログインに失敗しました';

  try{
    // NextAuthの signIn を呼ぶ (redirect:false で手動リダイレクトを制御)
    // Next Auth は signIn で CSRF検証するのでパラメータでの検証不要
    const result = await signIn('credentials', {
      ...formData,
      redirect: false,
      callbackUrl,
    });

    // 通常発生しない
    if(!result){
      const response: LoginResponse = {
        ok:           false,
        status:       500,
        url:          null,
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // OK
    if (result.ok) {
      const response: LoginResponse = {
        ...result,
        message:      'ログインしました',
        toastType:    'success',
        toastMessage: 'ログインしました',
      };
      return response;
    };
    // NG
    const response: LoginResponse = {
      ...result,
      message:      result.error ?? responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  } catch {
    const response: LoginResponse = {
      ok:           false,
      status:       500,
      url:          null,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};
// login △