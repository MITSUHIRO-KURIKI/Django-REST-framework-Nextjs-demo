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

export const emailSchema = z
  .string()
  .email({ message: 'メールアドレスを入力してください' })
  .max(254, { message: 'このメールアドレスは登録できません' })