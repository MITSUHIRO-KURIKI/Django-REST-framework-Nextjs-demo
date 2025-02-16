'use client'

// react
import {
  useState,
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
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
import { Button } from '@/app/components/ui/shadcn/button';
import { Input } from '@/app/components/ui/shadcn/input';
import { Label } from '@/app/components/ui/shadcn/label';
// icons
import { Loader2 } from 'lucide-react';
// features
import { sanitizeDOMPurify } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// type
import {
  roomSettingsRoomNameChangeSchema as vrmChatRoomSettingsRoomNameChangeSchema,
} from '@/features/api/vrmchat';
import {
  roomSettingsRoomNameChangeSchema as llmChatRoomSettingsRoomNameChangeSchema,
} from '@/features/api/llmchat';


// type
type RoomNameChangeDialogProps = {
  onSubmit:                 (roomId: string, editRoomName: string) => Promise<void>;
  isSending:                boolean;
  setIsSending:             Dispatch<SetStateAction<boolean>>;
  roomNameSchema:           typeof llmChatRoomSettingsRoomNameChangeSchema | typeof vrmChatRoomSettingsRoomNameChangeSchema;
  editRoomName:             string;
  setEditRoomName:          Dispatch<SetStateAction<string>>;
  editRoomNametargetRoomId: string;
  modalOpen:                boolean;
  setModalOpen:             Dispatch<SetStateAction<boolean>>;
};

// RoomNameChangeDialog ▽
export function RoomNameChangeDialog({
  isSending,
  onSubmit,
  setIsSending,
  roomNameSchema,
  editRoomName,
  setEditRoomName,
  editRoomNametargetRoomId,
  modalOpen,
  setModalOpen, }: RoomNameChangeDialogProps): ReactElement {

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmitRoomName = async (): Promise<void> => {
    if (!editRoomName || !editRoomNametargetRoomId) return;

    // valid
    const result = roomNameSchema.safeParse({room_name: editRoomName,});
    if (!result.success) {
      showToast('error', 'error');
      setErrorMsg(result.error.errors[0].message);
      return;
    };

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    try {
      await onSubmit(editRoomNametargetRoomId, sanitizeDOMPurify(editRoomName));
      // モーダルを閉じる
      setModalOpen(false);
    } catch {
      showToast('error', 'error');
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };

  return (
    <Dialog open         = {modalOpen}
            onOpenChange = {setModalOpen}>
      <DialogContent className='bg-sidebar'>
        <DialogHeader>
          <DialogTitle className='sr-only'>
            ルーム名を変更
          </DialogTitle>
          <DialogDescription className='sr-only'>
            ルーム名を変更できます
          </DialogDescription>
        </DialogHeader>

        <Label htmlFor   = 'roomName'
               className = 'mb-1 block text-sm font-medium'>
          ルーム名を変更
        </Label>
        {/* Alert */}
        { errorMsg && (
          <Alert variant   = 'destructive'
                 className = 'mb-2'>
            <AlertDescription>
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}
        <Input id       = 'roomName'
               name     = 'roomName'
               value    = {editRoomName}
               onChange = {(e: ChangeEvent<HTMLInputElement>) => setEditRoomName(e.target.value)}
               required />

        <DialogFooter>
          <Button variant='outline' onClick={() => setModalOpen(false)}>
            キャンセル
          </Button>
          <Button onClick  = {handleSubmitRoomName}
                  disabled = {isSending} >
            {isSending ? (<Loader2 className='animate-spin' />) : ('変更')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};
// RoomNameChangeDialog △