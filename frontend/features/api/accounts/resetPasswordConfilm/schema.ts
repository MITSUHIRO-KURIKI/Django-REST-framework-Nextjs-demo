import { z } from 'zod';
import { passwordSchema } from '../utils/schema';


export const resetPasswordConfilmFormSchema = z
  .object({
    new_password:    passwordSchema,
    re_new_password: z.string().min(1, { message: '確認のため再度パスワードを入力してください' }),
  })
  .refine(
    (data) => data.re_new_password === data.new_password, {
      message: '新しいパスワードと確認用パスワードが一致しません', path: ['re_new_password'],
  })

export type ResetPasswordConfilmFormInputType = z.infer<typeof resetPasswordConfilmFormSchema>;