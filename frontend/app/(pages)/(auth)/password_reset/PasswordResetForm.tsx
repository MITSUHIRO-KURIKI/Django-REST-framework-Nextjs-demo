'use client';

// next-auth
import { getCsrfToken } from 'next-auth/react';
// react
import {
  useState,
  useEffect,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// hookform
import {
  resetPassword,
  passwordResetFormSchema,
  type PasswordResetFormInputType
} from '@/features/api/accounts/resetPassword';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from '@/app/components/ui/shadcn/form';
// shadcn
import { Input } from '@/app/components/ui/shadcn/input';
import { Button } from '@/app/components/ui/shadcn/button';
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2, CircleCheckBig } from 'lucide-react';
// components
import { showToast } from '@/app/components/utils';


type PasswordResetFormProps = {
  isSuccess:    boolean;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
  isSending:    boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  setErrorMsg:  Dispatch<SetStateAction<string>>;
};

// PasswordResetForm ▽
export function PasswordResetForm({
  isSuccess,
  setIsSuccess,
  isSending,
  setIsSending,
  setErrorMsg,}: PasswordResetFormProps): ReactElement {

  // ++++++++++
  // form
  // - useForm
  const form = useForm<PasswordResetFormInputType>({
    resolver: zodResolver(passwordResetFormSchema),
    defaultValues: {
      email:     '',
      csrfToken: '',
    },
  });
  // - form data
  const [csrfToken, setCsrfTokenValue] = useState<string>('');
  useEffect(() => {
    getCsrfToken().then((token) => {
      if (token) {
        setCsrfTokenValue(token);
        form.setValue('csrfToken', token);
      };
    });
  }, [form]);
  // - onSubmit
  const onSubmit: SubmitHandler<PasswordResetFormInputType> = async (data): Promise<void> => {

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    setErrorMsg('');
    try {
      const result = await resetPassword({
        email:     data.email,
        csrfToken: data.csrfToken,
      });
      showToast(result?.toastType, result?.toastMessage, {duration: 5000});
      if (result?.ok) {
        setIsSuccess(true);
      } else {
        setErrorMsg(result?.message ?? '');
      };
    } catch {
      showToast('error', 'パスワード再設定に失敗しました');
      setErrorMsg('パスワード再設定に失敗しました');
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };
  // ++++++++++

  return isSuccess ? (
    <div className="space-y-4">
      <Alert className="border-success text-success-foreground [&>svg]:text-success-foreground">
        <CircleCheckBig className='size-4' />
        <AlertTitle>パスワード再設定のメールを送信しました。</AlertTitle>
        <AlertDescription>送付されたメールからパスワードの再設定を行ってください。</AlertDescription>
      </Alert>
      <p className="text-xs leading-none text-muted-foreground">※メールが届かない場合、入力したメールアドレスが間違っている可能性があります。お手数ですが、再度、パスワード再設定をやり直してください。</p>
    </div>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* csrfToken */}
        <input type='hidden' {...form.register('csrfToken')} value={csrfToken} readOnly />
        <div className='flex flex-col gap-6'>
          <div className='grid gap-2'>
            {/* email */}
            <FormField control = {form.control}
                       name    = 'email'
                       render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='email'>Email</FormLabel>
                <FormControl>
                  <Input {...field}
                         type         = 'email'
                         id           = 'email'
                         className    = 'mt-2'
                         autoComplete = 'username'
                         autoFocus
                         required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type      = 'submit'
                  className = 'w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='mr-2 size-4 animate-spin' /> : 'パスワード再設定'}
          </Button>
        </div>
      </form>
    </Form>
  )
};
// PasswordResetForm △