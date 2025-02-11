import { z } from 'zod';
import { passwordSchema, emailSchema } from '../utils/schema';


export const signupFormSchema = z 
  .object({
    email:       emailSchema,
    password:    passwordSchema,
    re_password: z.string().min(1,{ message: '確認のため再度パスワードを入力してください' }),
  })
  .refine(
    (data) => data.re_password === data.password, {
      message: '確認用パスワードが一致しません', path: ['re_password'],
  })

export type SignupFormInputType = z.infer<typeof signupFormSchema>;