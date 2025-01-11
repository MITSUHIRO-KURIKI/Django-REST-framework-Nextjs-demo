'use client'

// next
import { useRouter, usePathname } from 'next/navigation';
// react
import {
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/shadcn/dialog';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import {
  Loader2,
} from 'lucide-react';
// features
import { deleteRoom } from '@/features/api/vrmchat';
// components
import { showToast } from '@/app/components/utils';
// include
import { type SubItem } from '../data';

// type
type DeleteCheckDialogDialogProps = {
  setVrmChatItems:         Dispatch<SetStateAction<SubItem[]>>;
  isVrmChatRoomSending:    boolean;
  setIsVrmChatRoomSending: Dispatch<SetStateAction<boolean>>;
  deleteRoomTargetRoomId:  string;
  deleteRoomModalOpen:     boolean;
  setDeleteRoomModalOpen:  Dispatch<SetStateAction<boolean>>;
};

// DeleteCheckDialog ▽
export function DeleteCheckDialog({
    setVrmChatItems,
    isVrmChatRoomSending,
    setIsVrmChatRoomSending,
    deleteRoomTargetRoomId,
    deleteRoomModalOpen,
    setDeleteRoomModalOpen, }: DeleteCheckDialogDialogProps): ReactElement {

  const router   = useRouter();
  const pathname = usePathname(); 

  const handleDeleteVrmChatRoom = async (): Promise<void> => {
    if (!deleteRoomTargetRoomId) return;
    // 多重送信防止
    if (isVrmChatRoomSending) return;

    setIsVrmChatRoomSending(true);
    try {
      const result = await deleteRoom(deleteRoomTargetRoomId);
      if (result.ok) {
        // メニューから削除
        setVrmChatItems((prev) => prev.filter((item) => item.key !== deleteRoomTargetRoomId));
        // deleteRoomTargetRoomId が現在のパスに含まれていたらリダイレクト
        const currentRoomId = pathname.split('/').pop();
        if (currentRoomId === deleteRoomTargetRoomId) {
          router.push('/vrmchat');
        };
      } else {
        showToast('error', 'error');
      };
    } catch {
      showToast('error', 'error');
    } finally {
      // モーダルを閉じる
      setDeleteRoomModalOpen(false);
      // 多重送信防止
      setIsVrmChatRoomSending(false);
    };
  };

  return (
      <Dialog open         = {deleteRoomModalOpen}
              onOpenChange = {setDeleteRoomModalOpen}>
        <DialogContent className='bg-sidebar'>
        <DialogHeader>
            <DialogTitle>
              ルームを削除しますか？
            </DialogTitle>
            <DialogDescription className='sr-only'>
              ルーム名を削除します
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteRoomModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick  = {handleDeleteVrmChatRoom}
                    disabled = {isVrmChatRoomSending} >
              {isVrmChatRoomSending ? (<Loader2 className='mr-2 size-4 animate-spin' />) : ('削除する')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
};
// DeleteCheckDialog △