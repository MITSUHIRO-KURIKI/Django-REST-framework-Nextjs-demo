'use client'

// next
import { useRouter, usePathname } from 'next/navigation';
// react
import {
  useState,
  useEffect,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  ChangeEvent,
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
import { Input } from '@/app/components/ui/shadcn/input';
import { Button } from '@/app/components/ui/shadcn/button';
import { Label } from '@/app/components/ui/shadcn/label';
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

  const router                                      = useRouter();
  const pathname                                    = usePathname();

  const [safetyCheckInput, setSafetyCheckInput] = useState<string>('');
  const [errorMsg, setErrorMsg]                 = useState<string>('');
  useEffect(() => {
    if (deleteRoomModalOpen) {
      setSafetyCheckInput('')
      setErrorMsg('')
    };
  }, [deleteRoomModalOpen])

  const handleDeleteVrmChatRoom = async (): Promise<void> => {
    if (!deleteRoomTargetRoomId) return;

    // SafetyCheck
    if (safetyCheckInput !== 'delete') {
      showToast('error', 'error');
      setErrorMsg('削除を実行するには「delete」と入力してください');
      return;
    };

    // 多重送信防止
    if (isVrmChatRoomSending) return;

    setIsVrmChatRoomSending(true);
    setErrorMsg('');
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
          <DialogDescription>
            この操作は元に戻せません
          </DialogDescription>
        </DialogHeader>

        <div className = 'my-2'>
          { errorMsg ? (
            <p className = 'mb-2 text-sm text-destructive select-none'>
              {errorMsg}
            </p>
          ) : (
            <p className = 'mb-2 text-sm select-none'>
              「delete」と入力してください
            </p>
          )}
          <Label htmlFor='safetyCheck' className='sr-only'>削除確認</Label>
          <Input type         = 'text'
                 id           = 'safetyCheck'
                 value        = {safetyCheckInput}
                 onChange     = {(e: ChangeEvent<HTMLInputElement>) => {setSafetyCheckInput(e.target.value);}}
                 placeholder  = 'delete'
                 autoComplete = 'off' />
        </div>

          <DialogFooter className = 'flex !justify-between'>
            <Button variant   = 'destructive'
                    className = 'order-2 mt-2 sm:order-1'
                    onClick   = {handleDeleteVrmChatRoom}
                    disabled  = {isVrmChatRoomSending} >
              {isVrmChatRoomSending ? (<Loader2 className='size-4 animate-spin' />) : ('削除する')}
            </Button>
            <Button variant   = 'outline'
                    className = 'order-1 mt-2 sm:order-2'
                    onClick   = {() => setDeleteRoomModalOpen(false)}>
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
};
// DeleteCheckDialog △