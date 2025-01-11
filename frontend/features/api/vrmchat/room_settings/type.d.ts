export type ModelNameChoices = {
  value: number | string;
  label: string;
};

export type RoomSettingsResponseData = {
  id:                number;
  roomId:            number;
  roomName:          string;
  modelName:         number;
  systemSentence:    string | null;
  assistantSentence: string | null;
  historyLen:        number;
  maxTokens:         number;
  temperature:       number;
  topP:              number;
  presencePenalty:   number;
  frequencyPenalty:  number;
  comment:           string | null;
  modelNameChoices:  ModelNameChoices[],
};

export type RoomSettingsRoomNameListResponseItem = {
  roomId_RoomId: string;
  roomName:      string;
};
export type RoomSettingsRoomNameListResponseData = RoomSettingsRoomNameItem[];