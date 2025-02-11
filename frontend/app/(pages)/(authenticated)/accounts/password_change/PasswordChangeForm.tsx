'use client';

// next-auth
import { signOut } from 'next-auth/react';
// react
import { useState, useEffect, type ReactElement } from 'react';
// paths
import { apiPath, pagesPath } from '@/features/paths/frontend';
// hookform
import {
  passwordSchema,
  setPassword,
  setPasswordFormSchema,
  type SetPasswordFormInputType,
} from '@/features/api/accounts';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from '@/app/components/ui/shadcn/form';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import { Input } from '@/app/components/ui/shadcn/input';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2 } from 'lucide-react';
// features
import { UrlToString } from '@/features/utils';
import { FrontendWithCredentialsApiClient } from '@/features/apiClients';
// components
import { showToast, OverlaySpinner } from '@/app/components/utils';
// lib
import { zxcvbn } from '@zxcvbn-ts/core';
import { setupZxcvbnOptions, getZxcvbnStrengthLabel } from '@/app/components/lib/zxcvbn-ts'
setupZxcvbnOptions(); // セットアップ


// PasswordChangeForm
export function PasswordChangeForm(): ReactElement {

  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  // ++++++++++
  // form
  // - useForm
  const form = useForm<SetPasswordFormInputType>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      current_password: '',
      new_password:     '',
      re_new_password:  '',
    },
  });
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
  const onSubmit: SubmitHandler<SetPasswordFormInputType> = async (data) => {

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
      const result = await setPassword(data);
      showToast(result?.toastType, result?.toastMessage, { duration: 5000 });
      if (result.ok) {
        //
      } else {
        setErrorMsg(result?.message ?? '');
      };
    } catch {
      showToast('error', 'パスワード変更に失敗しました');
      setErrorMsg('パスワード変更に失敗しました');
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };
  // ++++++++++

  return (
    <>
      {/* OverlaySpinner */}
      <OverlaySpinner isActivate={isSending} />

      {/* Alert */}
      {errorMsg && (
        <Alert variant='destructive' className='mb-4'>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6'>

          {/* current_password (Input) */}
          <FormField control = {form.control}
                     name    = 'current_password'
                     render  = {({ field }) => (
              <FormItem>
                <div className='flex items-center'>
                  <FormLabel htmlFor='password'>現在のパスワード</FormLabel>
                  <Button type      = 'button'
                          variant   = 'linelink'
                          size      = 'fit'
                          className = {cn(
                            'ml-auto inline-block',
                          )}
                          onClick = {async (e) => {
                            e.preventDefault();
                            await FrontendWithCredentialsApiClient.post(apiPath.authPath.logout);
                            await signOut({
                              callbackUrl: UrlToString(pagesPath.authPath.password_reset.$url()), 
                            });
                          }}>
                    パスワードをお忘れですか?
                  </Button>
                </div>
                <FormControl>
                  <Input {...field}
                         type         = 'password'
                         id           = 'password'
                         className    = 'border-muted-foreground'
                         autoComplete = 'current-password'
                         required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          {/* new_password (Input) */}
          <FormField control = {form.control}
                     name    = 'new_password'
                     render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='new_password'>新しいパスワード</FormLabel>
                <FormControl>
                  <Input {...field}
                         type         = 'password'
                         id           = 'new_password'
                         className    = 'border-muted-foreground'
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

          {/* re_new_password (Input) */}
          <FormField control = {form.control}
                     name    = 're_new_password'
                     render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='re_new_password'>新しいパスワード (Check)</FormLabel>
                <FormControl>
                  <Input {...field}
                         type         = 'password'
                         id           = 're_new_password'
                         className    = 'border-muted-foreground'
                         autoComplete = 'new-password'
                         required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          <Button type      = 'submit'
                  className = 'w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='size-4 animate-spin' /> : '設定を更新'}
          </Button>
        </form>
      </Form>
    </>
  );
};