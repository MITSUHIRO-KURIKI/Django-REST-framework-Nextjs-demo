// metadata
import { metadataConfig } from './metadata';
export const metadata = metadataConfig;
// react
import { Suspense, type ReactElement } from 'react';
// import
import Loading from '@/app/loading';
// include
import { VrmChatContent } from './VrmChatContent';


// DashBoardPage ▽
export default async function DashBoardPage(): Promise<ReactElement> {
  return (
    <Suspense fallback={<Loading />}>
      <VrmChatContent />
    </Suspense>
  );
};
// DashBoardPage △