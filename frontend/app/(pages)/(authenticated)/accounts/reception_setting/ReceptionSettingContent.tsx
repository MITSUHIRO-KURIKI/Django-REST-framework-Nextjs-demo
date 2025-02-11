// react
import { type ReactElement } from 'react';
// include
import { ReceptionSettingForm } from './ReceptionSettingForm';
// type
import type { UserReceptionSettingResponseData } from '@/features/api/user_properties';

// ReceptionSettingContent
export function ReceptionSettingContent({ userReceptionSettingData }: {userReceptionSettingData: UserReceptionSettingResponseData}): ReactElement {
  return (
    <div className = 'mx-auto max-w-md pt-4'>
      <p className='mb-4 text-lg font-bold'>お知らせの受信設定</p>
      <ReceptionSettingForm userReceptionSettingData={userReceptionSettingData} />
    </div>
  );
};