'use client';

// react
import { memo } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
// components
import { MarkdownRender } from '@/app/components/utils';
// type
import { MessageProps } from '../ClientUI';


// historyMessageItem
function historyMessageItem({ messageItem, userIconData, roomAiIconUrl }: MessageProps) {

  const userIconUrl = userIconData
                        ? (process.env.NEXT_PUBLIC_BACKEND_URL as string) + userIconData
                        : '/app/accounts/profile/user_icon/default/default.svg';

  return (
    <>
      <div className='flex items-start gap-2'>
        <div className='relative mb-[1rem]'>
          <img src       = {userIconUrl}
              alt       = 'User'
              className = 'size-[40px] rounded-full border select-none' />
          <span className = {cn(
                  'absolute -bottom-[1rem] left-1/2 -translate-x-1/2',
                  'text-nowrap text-xs text-gray-500 select-none',
                )}>
            User
          </span>
        </div>
        <div className='rounded-xl bg-muted w-full px-2 md:px-4'>
          <MarkdownRender markdownString  = {messageItem?.userMessage ?? ''}
                          isUseCopyButton = {false} />
        </div>
      </div>
      <div className='flex items-start gap-2'>
        <div className='relative mb-[1rem] hidden md:flex'>
          <img src       = {roomAiIconUrl}
               alt       = 'AI'
               className = 'size-[40px] rounded-full border select-none' />
          <span className = {cn(
                  'absolute -bottom-[1rem] left-1/2 -translate-x-1/2',
                  'text-nowrap text-xs text-gray-500 select-none',
                )}>
            AI
          </span>
        </div>
        <div className='rounded-xl w-full px-2 md:px-4'>
          <MarkdownRender markdownString={messageItem?.llmResponse ?? ''} />
        </div>
      </div>
    </>
  );
};

// receiveMessageItem
function receiveMessageItem({ messageItem, userIconData, roomAiIconUrl }: MessageProps) {

  const userIconUrl = userIconData
                        ? (process.env.NEXT_PUBLIC_BACKEND_URL as string) + userIconData
                        : '/app/accounts/profile/user_icon/default/default.svg';

  return (
    <>
      <div className='flex items-start gap-2'>
        <div className='relative mb-[1rem]'>
          <img src       = {userIconUrl}
              alt       = 'User'
              className = 'size-[40px] rounded-full border select-none' />
          <span className = {cn(
                  'absolute -bottom-[1rem] left-1/2 -translate-x-1/2',
                  'text-nowrap text-xs text-gray-500 select-none',
                )}>
            User
          </span>
        </div>
        <div className='rounded-xl bg-muted w-full px-2 md:px-4'>
          <MarkdownRender markdownString    = {messageItem?.userMessage ?? ''}
                          isStreamingRender = {true}
                          isUseCopyButton   = {false} />
        </div>
      </div>
      <div className='flex items-start gap-2'>
        <div className='relative mb-[1rem] hidden md:flex'>
          <img src       = {roomAiIconUrl}
               alt       = 'AI'
               className = 'size-[40px] rounded-full border select-none' />
          <span className = {cn(
                  'absolute -bottom-[1rem] left-1/2 -translate-x-1/2',
                  'text-nowrap text-xs text-gray-500 select-none',
                )}>
            AI
          </span>
        </div>
        <div className='rounded-xl w-full px-2 md:px-4'>
          <MarkdownRender markdownString    = {messageItem?.llmResponse ?? ''}
                          isStreamingRender = {true}
                          isUseCopyButton   = {false} />
        </div>
      </div>
    </>
  );
};

// メモ化
export const MemoHistoryMessageItem = memo(historyMessageItem);
export const MemoReceiveMessageItem = memo(receiveMessageItem);