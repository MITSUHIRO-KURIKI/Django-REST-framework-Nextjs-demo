'use client';

import {
  useState,
  useRef,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import { Textarea } from '@/app/components/ui/shadcn/textarea';
// icon
import { Send, Loader2 } from 'lucide-react';
// include
import { RoomSettingsSheet } from '../RoomSettings';
// type
import type { ClientUIProps } from '../../ClientContext';


// type
type RoomHeaderProps = {
  roomAiIconUrl:    string;
  setRoomAiIconUrl: Dispatch<SetStateAction<string>>;
  } & Pick<
    ClientUIProps,
    'roomId' | 'isWebSocketWaiting' | 'setSendMessages' | 'isWsSend' | 'setIsWsSend'
  >;

// RoomHeader
export function RoomHeader({
  roomId,
  isWebSocketWaiting,
  setSendMessages,
  isWsSend,
  setIsWsSend,
  roomAiIconUrl,
  setRoomAiIconUrl,
}: RoomHeaderProps): ReactElement {

  // チャットメッセージ入力用
  const [inputValue, setInputValue] = useState('');
  // テキストエリアを参照し、入力に応じて高さを自動調整
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // handleTextareaReSize
  const handleTextareaReSize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // 一度 height を auto にしてから scrollHeight を設定
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };
    setInputValue(e.target.value);
  };

  // チャット送信用ハンドラ
  const handleClickSend = () => {
    if (!inputValue.trim()) return;
    setSendMessages(inputValue);
    setIsWsSend(true);
    // インプットの初期化
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    };
  };

  return (
    <div className={cn(
          'sticky top-12 z-sticky',
          'w-full',
          'px-0 py-2 sm:px-4',
          'bg-background/30 dark:bg-background/30',
          'backdrop-blur-sm backdrop-filter',)}>

      <div className='flex w-full justify-center'>
        <div className={cn(
                'flex flex-col pr-1',
                'w-[100%] md:w-[90%] lg:w-[80%] max-w-[1000px]',
                'max-h-[240px]',
                'rounded-lg border border-muted-foreground',
                'backdrop-blur-sm backdrop-filter',
              )}>

          {/* インプット */}
          <Textarea className   = {cn(
                      'h-full resize-none',
                      'rounded-none border-0 shadow-none',
                      'px-2 mr-1',
                    )}
                    ref         = {textareaRef}
                    rows        = {1}
                    value       = {inputValue}
                    onChange    = {handleTextareaReSize}
                    placeholder = 'message input here...'
                    onKeyDown   = {(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleClickSend();
                      };
                    }} />

          <div className = {cn(
            'flex justify-end rounded-lg',
            'ml-1 mb-1 p-1 gap-2',
            'backdrop-blur-sm backdrop-filter',)}>
            {/* ルーム設定シート */}
            <RoomSettingsSheet roomId           = {roomId}
                               roomAiIconUrl    = {roomAiIconUrl}
                               setRoomAiIconUrl = {setRoomAiIconUrl}
                               className        = {cn(
                                'px-3 py-0 sm:px-4 sm:py-2',
                                'h-8 sm:h-9',
                                '[&_svg]:size-4 sm:[&_svg]:size-5',
                                'opacity-20 hover:opacity-100',
                                'bg-transparent hover:bg-transparent',
                               )}/>

            {/* 送信ボタン */}
            <Button className = {cn(
                      'px-3 py-0 sm:px-4 sm:py-2',
                      'h-8 sm:h-9',
                      '[&_svg]:size-4 sm:[&_svg]:size-5',
                    )}
                    onClick   = {handleClickSend}
                    disabled  = {isWebSocketWaiting || isWsSend} >
              {isWebSocketWaiting || isWsSend ? (
                <Loader2 className='animate-spin' />
              ) : (
                <>
                  <Send />
                  <span className='hidden lg:flex'>送信</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className='text-center text-[8px] text-gray-500'>
        生成AIの回答は必ずしも正しいとは限りません。重要な情報は確認をお願いします。
      </div>
    </div>
  );
};