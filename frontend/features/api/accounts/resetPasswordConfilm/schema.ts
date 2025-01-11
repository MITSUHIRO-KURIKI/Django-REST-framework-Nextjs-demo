import { z } from 'zod';
import { passwordSchema } from '@/features/api/accounts';

export const resetPasswordConfilmFormSchema = z
  .object({
    newPassword:   passwordSchema,
    reNewPassword: z.string().min(1,{ message: '確認のため再度パスワードを入力してください' }),
    csrfToken:     z.string().min(1, { message: 'フォームエラー' }),
  })
  .refine(
    (data) => data.reNewPassword === data.newPassword, {
      message: '新しいパスワードと確認用パスワードが一致しません', path: ['reNewPassword'],
  })

export type ResetPasswordConfilmFormInputType = z.infer<typeof resetPasswordConfilmFormSchema>;