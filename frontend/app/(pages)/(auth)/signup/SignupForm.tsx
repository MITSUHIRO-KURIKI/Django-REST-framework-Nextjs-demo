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
  signup,
  signupFormSchema,
  type SignupFormInputType
} from '@/features/api/accounts/signup';
import { passwordSchema } from '@/features/api/accounts';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
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
import { PasswordInputField } from '@/app/components/ui/form';
import { showToast } from '@/app/components/utils';
// lib
import { zxcvbn } from '@zxcvbn-ts/core';
import { setupZxcvbnOptions, getZxcvbnStrengthLabel } from '@/app/components/lib/zxcvbn-ts'
setupZxcvbnOptions(); // セットアップ

// type
type SignupFormProps = {
  isSuccess:    boolean;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
  isSending:    boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  setErrorMsg:  Dispatch<SetStateAction<string>>;
};

// SignupForm ▽
export function SignupForm({
  isSuccess,
  setIsSuccess,
  isSending,
  setIsSending,
  setErrorMsg,}: SignupFormProps): ReactElement {

  // ++++++++++
  // form
  // - useForm
  const form = useForm<SignupFormInputType>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email:       '',
      password:    '',
      re_password: '',
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
  const watchNewPassword                  = form.watch('password');
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
  const onSubmit: SubmitHandler<SignupFormInputType> = async (data): Promise<void> => {

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
      const result = await signup({
        formData:   data,
        csrfToken:  csrfToken,
      });
      showToast(result?.toastType, result?.toastMessage, {duration: 5000});
      if (result?.ok) {
        setIsSuccess(true);
      } else {
        setErrorMsg(result?.message ?? '');
      };
    } catch {
      showToast('error', 'サインアップに失敗しました');
      setErrorMsg('サインアップに失敗しました');
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
        <AlertTitle>仮登録を受け付けました。</AlertTitle>
        <AlertDescription>送付されたメールから認証を完了してください。</AlertDescription>
      </Alert>
      <p className='text-xs leading-none text-muted-foreground select-none'>
        ※メールが届かない場合、入力したメールアドレスが間違っている可能性があります。お手数ですが、再度、登録をやり直してください。
      </p>
    </div>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
          <div className='grid gap-2'>
            {/* password */}
            <FormField control = {form.control}
                       name    = 'password'
                       render  = {({ field }) => (
            <FormItem>
                <FormLabel htmlFor='password'>Password</FormLabel>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 'password'
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
                <FormDescription className='mt-1 text-xs text-gray-600'>
                  パスワード強度:<span className='ml-1 font-semibold'>{strengthLabel}</span>
                </FormDescription>
              </FormItem>
            )} />
          </div>
          <div className='grid gap-2'>
            {/* rePassword */}
            <FormField control = {form.control}
                       name    = 're_password'
                       render  = {({ field }) => (
            <FormItem>
                <FormLabel htmlFor='rePassword'>Password (Check)</FormLabel>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 're_password'
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
            {isSending ? <Loader2 className='size-4 animate-spin' /> : '新規登録'}
          </Button>
        </div>
      </form>
    </Form>
  )
};
// SignupForm △