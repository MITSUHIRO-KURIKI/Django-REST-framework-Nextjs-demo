'use client';

// next-auth
import { signOut } from 'next-auth/react';
// react
import {
  useState,
  type ReactElement,
  ChangeEvent,
} from 'react';
// paths
import { apiPath, pagesPath } from '@/features/paths/frontend';
// shadcn
import { Input } from '@/app/components/ui/shadcn/input';
import { Button } from '@/app/components/ui/shadcn/button';
import { Label } from '@/app/components/ui/shadcn/label';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2, CircleAlert } from 'lucide-react';
// features
import { deleteAccount } from '@/features/api/accounts';
import { FrontendWithCredentialsApiClient } from '@/features/apiClients';
// components
import { showToast, OverlaySpinner } from '@/app/components/utils';


// AccountDeleteForm
export function AccountDeleteForm(): ReactElement {

  const [isSending, setIsSending]               = useState(false);
  const [errorMsg, setErrorMsg]                 = useState('');
  const [safetyCheckInput, setSafetyCheckInput] = useState<string>('');

  const handleAccountDelete = async (): Promise<void> => {

    // SafetyCheck
    if (safetyCheckInput !== 'delete') {
      showToast('error', 'error');
      setErrorMsg('削除を実行するには「delete」と入力してください');
      return;
    };

    // 多重送信防止
    if (isSending) return;
    setErrorMsg('');

    setIsSending(true);
    try {
      const result = await deleteAccount();
      showToast(result?.toastType, result?.toastMessage, { duration: 5000 });
      if (result.ok) {
        // ログアウトしてトップに戻る
        await FrontendWithCredentialsApiClient.post(apiPath.authPath.logout);
        await signOut({callbackUrl: pagesPath.$url(),});
      } else {
        setErrorMsg(result?.message ?? '');
      };
    } catch {
      showToast('error', '削除に失敗しました');
      setErrorMsg('削除に失敗しました');
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };

  return (
    <>
      {/* OverlaySpinner */}
      <OverlaySpinner isActivate={isSending} />

      <Label className='block mb-4 text-lg font-bold'>アカウントの削除</Label>

      <Alert variant='destructive'>
        <AlertDescription className='flex items-center'>
          <CircleAlert className='size-6 mr-2' /><p>この操作は取り消せません。</p>
        </AlertDescription>
      </Alert>

      <div className = 'my-6'>
          { errorMsg ? (
            <p className = 'mb-2 text-sm text-destructive select-none'>
              {errorMsg}
            </p>
          ) : (
            <p className = 'mb-2 text-sm select-none'>
              「delete」と入力してください
            </p>
          )}
          <Label htmlFor='safetyCheck' className='sr-only'>削除確認</Label>
          <Input type         = 'text'
                 id           = 'safetyCheck'
                 className    = 'border-muted-foreground'
                 value        = {safetyCheckInput}
                 onChange     = {(e: ChangeEvent<HTMLInputElement>) => {setSafetyCheckInput(e.target.value);}}
                 placeholder  = 'delete'
                 autoComplete = 'off' />
      </div>

      <Button variant   = 'destructive'
              className = 'mt-4 w-full '
              onClick   = {handleAccountDelete}
              disabled  = {isSending} >
        {isSending ? (<Loader2 className='animate-spin' />) : ('アカウントを削除する')}
      </Button>
    </>
  );
}