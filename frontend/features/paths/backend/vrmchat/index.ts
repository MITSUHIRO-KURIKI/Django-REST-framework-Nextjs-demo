export const vrmChatPath: Record<string, string> = {
  // WebSocket
  ws_room:     'ws/vrmchat/room/',
  // Room model
  room_create: '/backendapi/vrmchat/room_create/',
  room_delete: '/backendapi/vrmchat/room_delete/',
  // RoomSettings model
  room_settings:                '/backendapi/vrmchat/room_settings/',
  room_settings_room_name:      '/backendapi/vrmchat/room_settings_room_name/',
  room_settings_room_name_list: '/backendapi/vrmchat/room_settings_room_name_list/',
} as const;

// prettier-ignore
export type vrmChatPath = typeof vrmChatPath;