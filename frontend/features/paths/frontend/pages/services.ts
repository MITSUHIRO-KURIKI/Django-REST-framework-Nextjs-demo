// types
import type { UrlConfig } from '@/features/paths/types.d';

export const servicesPath = {
  dashBoard: {
    $url: (args?: UrlConfig) => ({
      pathname: '/dashboard' as const,
      query:    args?.query,
      hash:     args?.hash,
    }),
  },
  llmChat: {
    $url: (args?: UrlConfig) => ({
      pathname: '/llmchat' as const,
      query:    args?.query,
      hash:     args?.hash,
    }),
  },
  vrmChat: {
    $url: (args?: UrlConfig) => ({
      pathname: '/vrmchat' as const,
      query:    args?.query,
      hash:     args?.hash,
    }),
  },
  vrmChatRoom: {
    $url: (args?: {_roomId: string} & UrlConfig) => {
      const roomId = args?._roomId ?? '';
      return {
        pathname: `/vrmchat/room/${roomId}` as const,
        query: {
          ...args?.query,
        },
        hash: args?.hash,
      };
    },
  },
};