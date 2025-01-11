// types
import type { UrlConfig } from '@/features/paths/types.d';


export const servicesPath = {
  dashBoard: {
    $url: (args?: UrlConfig) => ({
      pathname: '/dashboard' as const,
      query:    args?.query,
      hash:     args?.hash,
    })
  },
  llmChat: {
    $url: (args?: UrlConfig) => ({
      pathname: '/llmchat' as const,
      query:    args?.query,
      hash:     args?.hash,
    })
  },
  vrmChat: {
    $url: (args?: UrlConfig) => ({
      pathname: '/vrmchat' as const,
      query:    args?.query,
      hash:     args?.hash,
    })
  },
  vrmChatRoom: {
    $url: (args?: UrlConfig) => ({
      pathname: '/vrmchat/room' as const,
      query:    args?.query,
      hash:     args?.hash,
    })
  },
};