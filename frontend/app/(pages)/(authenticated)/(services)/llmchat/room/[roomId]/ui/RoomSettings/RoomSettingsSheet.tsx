'use client';

// react
import {
  useState,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// shadcn
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/app/components/ui/shadcn/sheet';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import { SlidersHorizontal } from 'lucide-react';
// include
import { RoomSettingsForm } from './RoomSettingsForm';


// type
type RoomSettingsSheetProps = {
  roomId:           string;
  roomAiIconUrl:    string;
  setRoomAiIconUrl: Dispatch<SetStateAction<string>>;
  className?:       string;
};

// RoomSettingsSheet
export function RoomSettingsSheet({ roomId, roomAiIconUrl, setRoomAiIconUrl, className }:RoomSettingsSheetProps): ReactElement {
  if (!roomId) {
    throw new Error('roomId is required in RoomSettingsSheet component');
  };

  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant   = 'ghost'
                className = {className}
                onClick   = {() => setSheetOpen(true)}>
          <SlidersHorizontal />
        </Button>
      </SheetTrigger>

      <SheetContent side='right' className='max-h-screen min-w-[100vw] overflow-y-auto bg-sidebar md:min-w-[40vw]'>
        <SheetHeader className='bg-sidebar'>
          <SheetTitle>ルーム設定</SheetTitle>
          <SheetDescription className='text-xs'>
            各種パラメータを変更できます。
          </SheetDescription>
        </SheetHeader>
        <div className='py-4'>
          <RoomSettingsForm roomId           = {roomId}
                            roomAiIconUrl    = {roomAiIconUrl}
                            setRoomAiIconUrl = {setRoomAiIconUrl}
                            setSheetOpen     = {setSheetOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
};