'use client';

// next
import Link from 'next/link';
// react
import { useState, type ReactElement } from 'react';
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
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// components
import { OverlaySpinner } from '@/app/components/utils';
// import
import { type PasswordResetConfilmParams } from './page';
// include
import { PasswordResetConfilmForm } from './PasswordResetConfilmForm';


// PasswordResetConfilmContent ▽
export function PasswordResetConfilmContent({ uid, token }: PasswordResetConfilmParams): ReactElement {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg]   = useState<string>('');
  
  return (
    <div className='grid lg:grid-cols-1'>

      <div className={cn(
        'flex min-h-svh flex-col w-full justify-center',)}>
        {/* OverlaySpinner */}
        <OverlaySpinner isActivate={isSending} />
        {/* logo */}
        <div className={cn(
          'invisible lg:visible',
          'flex justify-center p-4',
          'select-none',
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
                'select-none',
                'flex justify-center',)}>
                <Link href={pagesPath.$url()} className='font-bold'>
                  {process.env.NEXT_PUBLIC_SITE_NAME as string}
                </Link>
              </div>
              {/* Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-2xl'>パスワード再設定</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Alert */}
                  { errorMsg && (
                    <Alert variant   = 'destructive'
                          className = 'mb-4'>
                      <AlertDescription>
                        {errorMsg}
                      </AlertDescription>
                    </Alert>
                  )}
                  <PasswordResetConfilmForm
                    uid          = {uid}
                    token        = {token}
                    isSuccess    = {isSuccess}
                    setIsSuccess = {setIsSuccess}
                    isSending    = {isSending}
                    setIsSending = {setIsSending}
                    setErrorMsg  = {setErrorMsg} />
                </CardContent>
              </Card>
              {/* Foot */}
              <div className='text-center text-sm'>
                <Link href={pagesPath.authPath.login.$url()}
                      className='select-none hover:underline hover:underline-offset-4'>
                  ログインページに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// PasswordResetConfilmContent △