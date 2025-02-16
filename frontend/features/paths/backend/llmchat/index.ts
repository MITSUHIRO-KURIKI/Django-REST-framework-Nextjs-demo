export const llmChatPath: Record<string, string> = {
    // WebSocket
    ws_room: 'ws/llmchat/room/',
    // Room model
    room: '/backendapi/llmchat/room/',
    // RoomSettings model
    room_settings:                '/backendapi/llmchat/room_settings/',
    room_settings_room_name_list: '/backendapi/llmchat/room_settings/list/room_name',
    // Message model
    message: '/backendapi/llmchat/message/',
  } as const;
  
  // prettier-ignore
  export type llmChatPath = typeof llmChatPath;