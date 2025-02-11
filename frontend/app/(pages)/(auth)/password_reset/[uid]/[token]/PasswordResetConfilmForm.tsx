'use client';

// next-auth
import { getCsrfToken } from 'next-auth/react';
// next
import Link from 'next/link';
// react
import {
  useState,
  useEffect,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// hookform
import {
  passwordSchema,
  resetPasswordConfilm,
  resetPasswordConfilmFormSchema,
  type ResetPasswordConfilmFormInputType
} from '@/features/api/accounts';
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
import { cn } from '@/app/components/lib/shadcn';
import { Input } from '@/app/components/ui/shadcn/input';
import { Button } from '@/app/components/ui/shadcn/button';
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2, CircleCheckBig } from 'lucide-react';
// components
import { showToast } from '@/app/components/utils';
// lib
import { zxcvbn } from '@zxcvbn-ts/core';
import { setupZxcvbnOptions, getZxcvbnStrengthLabel } from '@/app/components/lib/zxcvbn-ts'
setupZxcvbnOptions(); // セットアップ
// import
import { type PasswordResetConfilmParams  } from './page';

// type
type PasswordResetConfilmFormProps = PasswordResetConfilmParams & {
  isSuccess:    boolean;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
  isSending:    boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  setErrorMsg:  Dispatch<SetStateAction<string>>;
};

// PasswordResetConfilmForm ▽
export function PasswordResetConfilmForm({
  uid,
  token,
  isSuccess,
  setIsSuccess,
  isSending,
  setIsSending,
  setErrorMsg,}: PasswordResetConfilmFormProps): ReactElement {

  // ++++++++++
  // form
  // - useForm
  const form = useForm<ResetPasswordConfilmFormInputType>({
    resolver: zodResolver(resetPasswordConfilmFormSchema),
    defaultValues: {
      new_password:    '',
      re_new_password: '',
    },
  });
  // - csrfToken
  const [csrfToken, setCsrfTokenValue] = useState<string>('');
  useEffect(() => {
    getCsrfToken().then((token) => {
      if (token) {
        setCsrfTokenValue(token);
      };
    });
  }, [form]);
  // パスワード強度 ▽
  const watchNewPassword                  = form.watch('new_password');
  const [passwordScore, setPasswordScore] = useState(0);
  const strengthLabel                     = getZxcvbnStrengthLabel(passwordScore);
  // newPassword の変更を監視してスコア計算
  useEffect(() => {
    if (!watchNewPassword) {
      setPasswordScore(0);
      return;
    };
    // zxcvbnでスコア計算
    const zxcvbnResult = zxcvbn(watchNewPassword);
    let score          = zxcvbnResult.score;
    // zod 必須条件を満たしていない場合、scoreを2までに抑える
    const parsed = passwordSchema.safeParse(watchNewPassword);
    if (!parsed.success && score > 2) {
      score = 2;
    };
    setPasswordScore(score);
  }, [watchNewPassword]);
  // パスワード強度 △
  // - onSubmit
  const onSubmit: SubmitHandler<ResetPasswordConfilmFormInputType> = async (data): Promise<void> => {

    // 多重送信防止
    if (isSending) return;
    // パスワード強度確認
    const zxcvbnResult = zxcvbn(watchNewPassword);
    if (zxcvbnResult.score < 3) {
      showToast('error', 'より複雑なパスワードを設定する必要があります');
      setErrorMsg('より複雑なパスワードを設定する必要があります');
      return;
    };

    setIsSending(true);
    setErrorMsg('');
    try {
      const result = await resetPasswordConfilm({
        formData:  data,
        uid:       uid,
        token:     token,
        csrfToken: csrfToken,
      });
      showToast(result?.toastType, result?.toastMessage);
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
    <div className='space-y-4'>
      <Alert className='border-success text-success-foreground [&>svg]:text-success-foreground'>
        <CircleCheckBig className='size-4' />
        <AlertTitle>パスワードを再設定しました。</AlertTitle>
        <AlertDescription>
          <Link href={pagesPath.authPath.login.$url()}
                className='hover:underline hover:underline-offset-4'>
                  ログインページ
          </Link>
          から再度ログインしてください
        </AlertDescription>
      </Alert>
    </div>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-6'>
          <div className='grid gap-2'>
            {/* new_password */}
            <FormField control = {form.control}
                       name    = 'new_password'
                       render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='new_password'>Password</FormLabel>
                <FormControl>
                  <Input {...field}
                         type         = 'password'
                         id           = 'new_password'
                         className    = 'mt-2'
                         autoComplete = 'new-password'
                         required />
                </FormControl>
                <FormMessage />
                {/* パスワード強度表示 */}
                <div className='mt-1 flex items-center gap-1'>
                  {[...Array(4)].map((_, idx) => {
                    const isActive = idx < passwordScore;
                    let barColor = '';
                    if (passwordScore <= 1) {
                      barColor = 'bg-danger';
                    } else if (passwordScore === 2) {
                      barColor = 'bg-warning';
                    } else {
                      barColor = 'bg-success';
                    };
                    return (
                      <div key={idx}
                           className={cn(
                            'h-1 flex-1 rounded transition-all',
                            isActive ? barColor : 'bg-gray-200',)}/>
                    );
                  })}
                </div>
                <p className='mt-1 text-xs text-gray-600'>
                  パスワード強度:<span className='ml-1 font-semibold'>{strengthLabel}</span>
                </p>
              </FormItem>
            )} />
          </div>
          <div className='grid gap-2'>
            {/* re_new_password */}
            <FormField control = {form.control}
                       name    = 're_new_password'
                       render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='re_new_password'>Password (Check)</FormLabel>
                <FormControl>
                  <Input {...field}
                         type         = 'password'
                         id           = 're_new_password'
                         className    = 'mt-2'
                         autoComplete = 'new-password'
                         required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type      = 'submit'
                  className = 'w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='size-4 animate-spin' /> : 'パスワード再設定'}
          </Button>
        </div>
      </form>
    </Form>
  )
};
// PasswordResetConfilmForm △