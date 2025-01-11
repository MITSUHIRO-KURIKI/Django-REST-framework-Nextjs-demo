import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(12, { message: '12文字以上にする必要があります' })
  .refine((val) => !/^\d+$/.test(val), {
    message: 'パスワードには英字を含めてください',
  })
  .refine((val) => /[a-zA-Z]/.test(val), {
    message: 'パスワードには英字を含めてください',
  })
  .refine((val) => /\d/.test(val), {
    message: 'パスワードには数字を含めてください',
  })
export const signupFormSchema = z 
  .object({
    email:      z.string().email({ message: 'メールアドレスを入力してください' }),
    password:   passwordSchema,
    rePassword: z.string().min(1,{ message: '確認のため再度パスワードを入力してください' }),
    csrfToken:  z.string().min(1, { message: 'フォームエラー' }),
  })
  .refine(
    (data) => data.rePassword === data.password, {
      message: '確認用パスワードが一致しません', path: ['rePassword'],
  })

export type SignupFormInputType = z.infer<typeof signupFormSchema>;