'use client';

// react
import { useState, type ReactElement } from 'react';
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
import { RoomSettingsForm } from '../form/RoomSettingsForm';


export function SheetRoomSettings({ roomId }: { roomId: string }): ReactElement {
  if (!roomId) {
    throw new Error('roomId is required in SheetRoomSettings component');
  };

  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant   = 'ghost'
                className = 'absolute right-0 [&_svg]:size-6'
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
          <RoomSettingsForm roomId       = {roomId}
                            setSheetOpen = {setSheetOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
};