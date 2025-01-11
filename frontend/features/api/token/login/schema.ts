import { z } from 'zod';


export const loginFormSchema = z.object({
  email:    z.string().email({ message: 'メールアドレスを入力してください' }),
  password: z.string().min(1,{ message: 'パスワードを入力してください' }),
});

export type LoginFormInputType = z.infer<typeof loginFormSchema>;