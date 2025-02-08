import { z } from 'zod';
import { emailSchema } from '../utils/schema';

export const passwordResetFormSchema = z.object({
  email:     emailSchema,
  csrfToken: z.string().min(1, { message: 'フォームエラー' }),
});

export type PasswordResetFormInputType = z.infer<typeof passwordResetFormSchema>;