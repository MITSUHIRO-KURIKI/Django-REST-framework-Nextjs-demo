// types
import type { UrlConfig } from '@/features/paths/types.d';


export const accountsPath = {
  user: {
    $url: (args?: {_uniqueAccountId: string;} & UrlConfig) => ({
      pathname: '/accounts/[uniqueAccountId]' as const,
      query:    {
        uniqueAccountId: args?._uniqueAccountId,
        ...args?.query,
      },
      hash: args?.hash,
    })
  },
  password_change: {
    $url: (args?: UrlConfig) => ({
      pathname: '/accounts/password_change' as const,
      query:    args?.query,
      hash:     args?.hash,
    })
  },
  reception_setting: {
    $url: (args?: UrlConfig) => ({
      pathname: '/accounts/reception_setting' as const,
      query:    args?.query,
      hash:     args?.hash,
    })
  },
  delete: {
    $url: (args?: UrlConfig) => ({
      pathname: '/accounts/delete' as const,
      query:    args?.query,
      hash:     args?.hash,
    })
  },
};