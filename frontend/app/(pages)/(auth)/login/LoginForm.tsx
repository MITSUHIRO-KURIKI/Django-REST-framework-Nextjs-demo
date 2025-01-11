// next
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// react
import type { ReactElement, Dispatch, SetStateAction } from 'react';
// paths
import { pagesPath } from '@/features/paths/frontend';
// hookform
import {
  login,
  loginFormSchema,
  type LoginFormInputType
} from '@/features/api/token';
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
// icons
import { Loader2 } from 'lucide-react';
// components
import { showToast } from '@/app/components/utils';

type LoginFormProps = {
  isSending:    boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  setErrorMsg:  Dispatch<SetStateAction<string>>;
  callbackUrl:  string;
};

// LoginForm ▽
export function LoginForm({
  isSending,
  setIsSending,
  setErrorMsg,
  callbackUrl,}: LoginFormProps): ReactElement {

  const router = useRouter();

  // ++++++++++
  // form
  // - useForm
  const form = useForm<LoginFormInputType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email:    '',
      password: '',
    },
  });
  // - onSubmit
  const onSubmit: SubmitHandler<LoginFormInputType> = async (data): Promise<void> => {

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    setErrorMsg('');
    try {
      const result = await login({
        email:    data.email,
        password: data.password,
        callbackUrl,
      });
      showToast(result?.toastType, result?.toastMessage);
      if (result?.ok) {
        router.push(callbackUrl);
      } else {
        setErrorMsg(result?.message ?? '');
      };
    } catch (e){
      console.log(e)
      showToast('error', 'ログインに失敗しました');
      setErrorMsg('ログインに失敗しました');
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };
  // ++++++++++

  return (
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
            <div className='flex items-center'>
              <FormLabel htmlFor='password'>Password</FormLabel>
              <Link href      = {pagesPath.authPath.password_reset.$url()}
                    className = {cn(
                      'ml-auto inline-block text-sm underline-offset-4',
                      'hover:underline',)}>
                パスワードをお忘れですか?
              </Link>
            </div>
            {/* password */}
            <FormField control = {form.control}
                       name    = 'password'
                       render  = {({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field}
                         type         = 'password'
                         id           = 'password'
                         className    = 'mt-2'
                         autoComplete = 'current-password'
                         required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type      = 'submit'
                  className = 'w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='mr-2 size-4 animate-spin' /> : 'ログイン'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
// LoginForm △