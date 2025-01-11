'use client';

// next-auth
import { getCsrfToken } from 'next-auth/react';
// next
import Link from 'next/link';
// react
import { useState, useEffect, type ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/shadcn/card';
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { CircleCheckBig, CircleDashed } from 'lucide-react';
// features
import { activation, type ActivationParams } from '@/features/api/accounts';
// components
import { OverlaySpinner, showToast } from '@/app/components/utils';


// ActivateContent ▽
export function ActivateContent({ uid, token }: ActivationParams): ReactElement {
  const [isSuccess, setIsSuccess]      = useState<boolean | null>(null);
  const [isLoading, setIsLoading]      = useState<boolean>(false);
  const [csrfToken, setCsrfTokenValue] = useState<string>('');

  // getCsrfToken
  useEffect(() => {
    getCsrfToken().then((token) => {
      if (token) setCsrfTokenValue(token);
      else setIsLoading(false);
    });
  }, [csrfToken, uid, token]);

  // CSRFトークンがセットされたとき1度だけ実行
  useEffect(() => {
    if (csrfToken) {
      setIsLoading(true);

      activation({
        uid:   uid,
        token: token,
        csrfToken,
      }).then(result => {
        showToast(result?.toastType, result?.toastMessage, {duration: 5000});
        if (result?.ok) {
          setIsSuccess(true);
        } else {
          setIsSuccess(false);
        };
      }).catch(() => {
        setIsSuccess(false);
        showToast('error', 'サインアップに失敗しました');
      })
      .finally(() => {
        setIsLoading(false);
      });
    };
  }, [csrfToken]);

  return (
    <div className='grid lg:grid-cols-1'>

      <div className={cn(
        'flex min-h-svh flex-col w-full justify-center',)}>
        {/* OverlaySpinner */}
        <OverlaySpinner isActivate={isLoading} />
        {/* logo */}
        <div className={cn(
          'invisible lg:visible',
          'flex justify-center p-4',
          'md:justify-start',)}>
          <Link href={pagesPath.$url()} className='font-bold'>
                {process.env.NEXT_PUBLIC_SITE_NAME as string}
          </Link>
        </div>
        {/* main */}
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-lg'>
            <div className='flex flex-col gap-4'>
              {/* logo */}
              <div className={cn(
                'visible lg:invisible',
                'flex justify-center',)}>
                <Link href={pagesPath.$url()} className='font-bold'>
                  {process.env.NEXT_PUBLIC_SITE_NAME as string}
                </Link>
              </div>
              {/* Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-2xl'>
                    {isSuccess === null ? 'しばらくお待ちください' : (isSuccess ? '本登録完了' : '本登録が完了できませんでした')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Alert */}

                  { isSuccess ? (
                    <Alert className="border-success text-success-foreground [&>svg]:text-success-foreground">
                      <CircleCheckBig className='size-4' />
                      <AlertTitle>アカウント本登録が完了しました</AlertTitle>
                      <AlertDescription>
                        <Link href={pagesPath.authPath.login.$url()}
                              className='hover:underline hover:underline-offset-4'>
                                ログインページ
                        </Link>
                        からログインしてください
                      </AlertDescription>
                    </Alert>
                  ) : isSuccess === false ? (
                    <>
                      <Alert className = 'mb-4 border-danger text-danger-foreground [&>svg]:text-danger-foreground'>
                        <CircleDashed className='size-4' />
                        <AlertTitle>アカウント本登録に失敗しました</AlertTitle>
                        <AlertDescription>
                          <Link href={pagesPath.authPath.signup.$url()}
                                className='hover:underline hover:underline-offset-4'>
                                  新規登録ページ
                          </Link>
                          から再度仮登録を行ってください。
                        </AlertDescription>
                      </Alert>
                      <p className='text-xs leading-none text-muted-foreground'>
                        エラーが続く場合にはお問い合わせページよりお問い合わせください。
                      </p>
                    </>
                  ) : null}
                </CardContent>
              </Card>
              {/* Foot */}
              <div className='text-center text-sm'>
                { isSuccess ? (
                  <Link href={pagesPath.authPath.login.$url()}
                        className='hover:underline hover:underline-offset-4'>
                    ログインページ
                  </Link>
                ) : (
                  <Link href      = {pagesPath.authPath.signup.$url()}
                        className = 'hover:underline hover:underline-offset-4'>
                    新規登録ページ
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ActivateContent △