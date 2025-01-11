// next-auth
import { signIn, type SignInResponse } from 'next-auth/react';
// import
import { LoginFormInputType } from './schema';


// type
type LoginParams = {
  callbackUrl?: string;
} & LoginFormInputType;
interface LoginResponse extends Omit<SignInResponse, 'error'> {
  message?:      string;
  toastType?:    string;
  toastMessage?: string;
};

// login ▽
export async function login(params: LoginParams): Promise<LoginResponse> {
  try{
    const { email, password, callbackUrl } = params;

    // NextAuthの signIn を呼ぶ (redirect:false で手動リダイレクトを制御)
    // Next Auth は signIn で CSRF検証するのでパラメータでの検証不要
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if(!result){
      const response: LoginResponse = {
        ok: false, status: 500, url: null,
        message:      'ログインに失敗しました',
        toastType:    'error',
        toastMessage: 'ログインに失敗しました',
      };
      return response;
    };

    const response: LoginResponse = {
      ...result,
      message:      result?.ok ? 'ログインしました' : 'ログインに失敗しました',
      toastType:    result?.ok ? 'success' : 'error',
      toastMessage: result?.ok ? 'ログインしました' : 'ログインに失敗しました',
    };
    return response;
  } catch {
    const response: LoginResponse = {
      ok: false, status: 500, url: null,
      message:      'ログインに失敗しました',
      toastType:    'error',
      toastMessage: 'ログインに失敗しました',
    };
    return response;
  };
};
// login △