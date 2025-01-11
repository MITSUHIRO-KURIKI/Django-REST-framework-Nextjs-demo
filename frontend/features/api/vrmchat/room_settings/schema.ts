import { z } from 'zod';


export const roomSettingsFormSchema = z.object({
  model_name:         z.coerce.number().min(1),
  system_sentence:    z.string().max(1500, { message: '1500 字以内で入力してください' }),
  assistant_sentence: z.string().max(1500, { message: '1500 字以内で入力してください' }),
  history_len:        z.coerce.number().min(0),
  max_tokens:         z.coerce.number().min(1),
  temperature:        z.coerce.number().min(0).max(2),
  top_p:              z.coerce.number().min(0).max(1),
  presence_penalty:   z.coerce.number().min(-2).max(2),
  frequency_penalty:  z.coerce.number().min(-2).max(2),
  comment:            z.string().optional(),
});

export const roomSettingsRoomNameChangeSchema = z.object({
  room_name: z.string().min(1, {message: 'ルーム名を入力してください'}).max(50, {message: '50 字以内で入力してください'}),
});

export type RoomSettingsRoomNameChangeInputType = z.infer<typeof roomSettingsRoomNameChangeSchema>;
export type RoomSettingsFormInputType           = z.infer<typeof roomSettingsFormSchema>;