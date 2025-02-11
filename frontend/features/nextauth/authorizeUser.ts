'use server';

// lib
import axios from 'axios';
// include
import { login, getUserId } from './authEndpoint'; 
// types
import { type User } from '@/types/nextauth';

// authorizeUser ▽
export async function authorizeUser(email: string, password: string): Promise<User | null> {
    try {
      // ログイン
      const token = await login(email, password);
      // ユーザー情報取得
      const user = await getUserId(token.data.access);

      return {
        id:           user.data.uniqueAccountId ?? '',
        accessToken:  token.data.access         ?? null,
        refreshToken: token.data.refresh        ?? null,
      };  // UserObject -> callbacks.jwt の user にセットされる
    } catch(error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        
        const status  = error.response.status;

        if (status === 429) {
          throw new Error('時間をおいて再度お試しください');
        } else if (status === 403) {
          throw new Error('アカウントがロックされています');
        } else if (status === 401) {
          throw new Error('ログインに失敗しました');
        } else if (status) {
          throw new Error('ログインに失敗しました');
        };
      };
      throw new Error('ログインに失敗しました');
    };
  };
  // authorizeUser △