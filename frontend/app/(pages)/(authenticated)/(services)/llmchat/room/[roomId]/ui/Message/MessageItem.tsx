'use client';

// react
import { memo } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Skeleton } from '@/app/components/ui/shadcn/skeleton';
// components
import { MarkdownRender } from '@/app/components/utils';
// type
import { MessageProps } from '../ClientUI';


// HistoryMessageItem
function HistoryMessageItem({ messageItem, userIconData, roomAiIconUrl }: MessageProps) {

  const userIconUrl = userIconData
                        ? (process.env.NEXT_PUBLIC_BACKEND_URL as string) + userIconData
                        : '/app/accounts/profile/user_icon/default/default.svg';

  return (
    <>
      <div className='flex items-start gap-2'>
        <div className='relative mb-4'>
          <img src       = {userIconUrl}
              alt       = 'User'
              className = 'size-[40px] select-none rounded-full border' />
          <span className = {cn(
                  'absolute -bottom-[1rem] left-1/2 -translate-x-1/2',
                  'text-nowrap text-xs text-gray-500 select-none',
                )}>
            User
          </span>
        </div>
        <div className='w-full rounded-xl bg-muted px-2 md:px-4'>
          <MarkdownRender markdownString  = {messageItem?.userMessage ?? ''}
                          isUseCopyButton = {false} />
        </div>
      </div>
      <div className='flex items-start gap-2'>
        <div className='relative mb-4 hidden md:flex'>
          <img src       = {roomAiIconUrl}
               alt       = 'AI'
               className = 'size-[40px] select-none rounded-full border' />
          <span className = {cn(
                  'absolute -bottom-[1rem] left-1/2 -translate-x-1/2',
                  'text-nowrap text-xs text-gray-500 select-none',
                )}>
            AI
          </span>
        </div>
        <div className='w-full rounded-xl px-2 md:px-4'>
          <MarkdownRender markdownString={messageItem?.llmResponse ?? ''} />
        </div>
      </div>
    </>
  );
};

// ReceiveMessageItem
function ReceiveMessageItem({ messageItem, userIconData, roomAiIconUrl }: MessageProps) {

  const userIconUrl = userIconData
                        ? (process.env.NEXT_PUBLIC_BACKEND_URL as string) + userIconData
                        : '/app/accounts/profile/user_icon/default/default.svg';

  return (
    <>
      <div className='flex items-start gap-2'>
        <div className='relative mb-4'>
          <img src       = {userIconUrl}
              alt       = 'User'
              className = 'size-[40px] select-none rounded-full border' />
          <span className = {cn(
                  'absolute -bottom-[1rem] left-1/2 -translate-x-1/2',
                  'text-nowrap text-xs text-gray-500 select-none',
                )}>
            User
          </span>
        </div>
        <div className='w-full rounded-xl bg-muted px-2 md:px-4'>
          <MarkdownRender markdownString    = {messageItem?.userMessage ?? ''}
                          isStreamingRender = {true}
                          isUseCopyButton   = {false} />
        </div>
      </div>
      <div className='flex items-start gap-2'>
        <div className='relative mb-4 hidden md:flex'>
          <img src       = {roomAiIconUrl}
               alt       = 'AI'
               className = 'size-[40px] select-none rounded-full border' />
          <span className = {cn(
                  'absolute -bottom-[1rem] left-1/2 -translate-x-1/2',
                  'text-nowrap text-xs text-gray-500 select-none',
                )}>
            AI
          </span>
        </div>
        <div className='w-full rounded-xl px-2 md:px-4'>
          { messageItem?.llmResponse ? (
            <MarkdownRender markdownString    = {messageItem?.llmResponse ?? ''}
                            isStreamingRender = {true}
                            isUseCopyButton   = {false} />
          ) : (
            <>
              <Skeleton className='mt-1 h-4 w-[25rem] rounded-full' />
              <Skeleton className='mt-1 h-4 w-80 rounded-full' />
            </>
          ) }
        </div>
      </div>
    </>
  );
};

// メモ化
export const MemoHistoryMessageItem = memo(HistoryMessageItem);
export const MemoReceiveMessageItem = memo(ReceiveMessageItem);