'use client';

// react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Card,
  CardContent,
} from '@/app/components/ui/shadcn/card';
import { ScrollArea } from '@/app/components/ui/shadcn/scroll-area';
import { Badge } from '@/app/components/ui/shadcn/badge';
// include
import { SheetRoomSettings } from './RoomSettingsSheet';
// type
import type { ClientUIProps } from '../ClientContext';
import { MicOff, Loader2 } from 'lucide-react';

// ClientUI ▽
export function ClientUI({
  roomId,
  recognizedText,
  recognizingText,
  receivedMessages,
  isStopRecognition,
  width,
  height,
  containerRef,
  isWebSocketWaiting,
  isLoading,
  isSpacePressed,
  isFirstRender,
}: ClientUIProps): ReactElement{

  return ( 
    <div className="relative size-full">
      {/* VRM */}
      <div ref       = {containerRef}
           className = {cn(
            'absolute top-1/2 left-1/2',
            '-translate-x-1/2 -translate-y-1/2',
            `w-[${width}px] h-[${height}px]`)} />

      {/* ルーム設定 */}
      <SheetRoomSettings roomId={roomId} />

      {/* 会話テキスト */}
      <Card className={cn(
          'absolute bottom-20 left-1/2 -translate-x-1/2',
          'w-[80%] h-[10rem]',
          'bg-transparent shadow-none',)}
          style={{
            top: 'clamp(0px, calc(50% + 200px), calc(100% - 10rem))',
          }}>
        <div className={cn(
            'pointer-events-none absolute inset-0',
            'bg-gradient-to-t from-background from-80% to-background/60',)}/>
        <CardContent className="relative z-10 flex h-full flex-col p-4 pr-16">
          {/* ユーザ発話 or AI レスポンスの表示切り替え */}
          { isFirstRender ? (
            <ScrollArea>
              <span className='text-foreground/60'>スペースキーを押している間、あなたの声を認識します。</span>
            </ScrollArea>
          ) : ( (!isStopRecognition || isWebSocketWaiting) ? (
            <ScrollArea>
              <span className='text-foreground'>{recognizedText}</span>
              <span className='text-foreground/60'>{recognizingText}</span>
            </ScrollArea>
          ) : (
            <ScrollArea>
              <span className='text-foreground'>{receivedMessages}</span>
            </ScrollArea>
          ))}

          {/* 会話ターンの表示 */}
          <div className='absolute -left-4 -top-4 z-sticky'>
            { (!isStopRecognition || isWebSocketWaiting) ? (
              <Badge className='bg-info font-semibold text-info-foreground hover:bg-info'>あなた</Badge>
            ) : (
              <Badge className='bg-success font-semibold text-success-foreground hover:bg-success'>AI</Badge>
            )}
          </div>

          {/* 音声認識の利用可能状態の表示 */}
          <div className='absolute right-4 top-1/2 -translate-y-1/2'>
            { (isLoading || isWebSocketWaiting) ? (
              <Loader2 className='size-9 animate-spin' />
            ) : ((isSpacePressed) ? (
              <div className="size-9 animate-spin rounded-bl-[1.9rem] rounded-br-[2.1rem] rounded-tl-[2.1rem] rounded-tr-[1.9rem] bg-gradient-to-r from-teal-400 to-blue-400" />
            ) : (<MicOff className='size-9' />))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
// ClientUI △