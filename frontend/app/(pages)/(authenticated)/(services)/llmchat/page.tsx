// metadata
import { metadataConfig } from './metadata';
export const metadata = metadataConfig;
// react
import { Suspense, type ReactElement } from 'react';
// import
import Loading from '@/app/loading';
// include
import { LlmChatContent } from './LlmChatContent';


// LlmChatPage ▽
export default async function LlmChatPage(): Promise<ReactElement> {
  return (
    <Suspense fallback={<Loading />}>
      <LlmChatContent />
    </Suspense>
  );
};
// LlmChatPage △