import { z } from 'zod';
import { passwordSchema, emailSchema } from '../utils/schema';


export const signupFormSchema = z 
  .object({
    email:      emailSchema,
    password:   passwordSchema,
    rePassword: z.string().min(1,{ message: '確認のため再度パスワードを入力してください' }),
    csrfToken:  z.string().min(1, { message: 'フォームエラー' }),
  })
  .refine(
    (data) => data.rePassword === data.password, {
      message: '確認用パスワードが一致しません', path: ['rePassword'],
  })

export type SignupFormInputType = z.infer<typeof signupFormSchema>;