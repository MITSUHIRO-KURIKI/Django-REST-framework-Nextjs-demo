// react
import { type ReactElement } from 'react';
// include
import { AccountDeleteForm } from './AccountDeleteForm';

import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// AccountDeleteContent
export function AccountDeleteContent(): ReactElement {
  return (
    <div className = 'mx-auto max-w-md pt-4'>
      <p className='mb-4 text-lg font-bold'>アカウントの削除</p>
      <Alert variant='destructive'>
        <AlertDescription>
          <p>この操作は取り消せません。</p>
        </AlertDescription>
      </Alert>
      <AccountDeleteForm />
    </div>
  );
};