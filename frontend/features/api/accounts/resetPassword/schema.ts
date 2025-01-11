import { z } from 'zod';


export const passwordResetFormSchema = z.object({
  email:     z.string().email({ message: 'メールアドレスを入力してください' }),
  csrfToken: z.string().min(1, { message: 'フォームエラー' }),
});

export type PasswordResetFormInputType = z.infer<typeof passwordResetFormSchema>;