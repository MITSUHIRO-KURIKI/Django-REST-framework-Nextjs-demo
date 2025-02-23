'use client';

// next
import { useRouter, usePathname } from 'next/navigation';
// react
import {
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { UrlToString } from '@/features/utils';
import {
  createRoom                      as llmChatCreateRoom,
  getRoomSettingsRoomNameList     as getLlmChatRoomSettingsRoomNameList,
  patchRoomSettingsRoomNameChange as patchLlmChatRoomSettingsRoomNameChange,
  deleteRoom                      as llmChatDeleteRoom,
} from '@/features/api/llmchat';
import {
  createRoom                      as vrmChatCreateRoom,
  getRoomSettingsRoomNameList     as getVrmChatRoomSettingsRoomNameList,
  patchRoomSettingsRoomNameChange as patchVrmChatRoomSettingsRoomNameChange,
  deleteRoom                      as vrmChatDeleteRoom,
} from '@/features/api/vrmchat';
// hooks
import { useCommonSubmit } from '@/app/hooks';
// type
import type { ItemBase } from '../data';


// type
type UseChatRoomsProps = {
  pageSize?:            number;
  initialLlmChatItems?: ItemBase[] | [];
  initialVrmChatItems?: ItemBase[] | [];
  setSidebarTitle?:     Dispatch<SetStateAction<string>>;
};

// useChatRooms ▽
export function useChatRooms({
  pageSize = 3,
  initialLlmChatItems,
  initialVrmChatItems,
  setSidebarTitle, }: UseChatRoomsProps) {

  // 状態管理系
  const router   = useRouter();
  const pathname = usePathname();
  const [isSending, setIsSending] = useState<boolean>(false);

  // ページネーション用
  const [llmChatPage, setLlmChatPage]   = useState<number>(1);
  const [vrmChatPage, setVrmChatPage]   = useState<number>(1);
  const [llmChatItems, setLlmChatItems] = useState<ItemBase[]>(initialLlmChatItems ?? []);
  const [vrmChatItems, setVrmChatItems] = useState<ItemBase[]>(initialVrmChatItems ?? []);

  // EditRoomName
  const [editRoomName, setEditRoomName]                                 = useState<string>('');
  const [editRoomNametargetRoomId, setEditRoomNameTargetRoomId]         = useState<string>('');
  const [llmChatEditRoomNameModalOpen, setLlmChatEditRoomNameModalOpen] = useState<boolean>(false);
  const [vrmChatEditRoomNameModalOpen, setVrmChatEditRoomNameModalOpen] = useState<boolean>(false);

  // DeleteRoom
  const [deleteRoomTargetRoomId, setDeleteRoomTargetRoomId]         = useState<string>('');
  const [llmChatDeleteRoomModalOpen, setLlmChatDeleteRoomModalOpen] = useState<boolean>(false);
  const [vrmChatDeleteRoomModalOpen, setVrmChatDeleteRoomModalOpen] = useState<boolean>(false);


  // LlmChatRoom coleback ▽
  // - LlmChatRoom (EditModal)
  const handleOpenLlmChatEditRoomModal = useCallback(({ roomId, currentName }: { roomId: string; currentName: string }) => {
    setEditRoomName(currentName);
    setEditRoomNameTargetRoomId(roomId);
    setLlmChatEditRoomNameModalOpen(true);
  }, []);
  // - LlmChatRoom (DeleteModal)
  const handleOpenLlmChatDeleteRoomModal = useCallback(({ roomId }: { roomId: string; }) => {
    setDeleteRoomTargetRoomId(roomId);
    setLlmChatDeleteRoomModalOpen(true);
  }, []);

  // - LlmChatRoom (Create)
  const handleCreateLlmChatRoom = useCommonSubmit<{setIsMobileMenuOpen?: Dispatch<SetStateAction<boolean>>}>({
    isSending,
    setIsSending,
    submitFunction: async () => {
      return await llmChatCreateRoom();
    },
    onSuccess: (result, {setIsMobileMenuOpen}) => {
      const roomId = (result.data as { roomId: string }).roomId;
      // メニューに追加
      const newItem: ItemBase = {
        key:   roomId,
        label: 'NewChatRoom',
        href:  roomId,
      };
      setLlmChatItems(prev => [newItem, ...prev]);
      // 新しい部屋にリダイレクト
      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
      router.push(UrlToString(pagesPath.servicesPath.llmChatRoom.$url({_roomId: roomId})));
    },
    defaultExceptionToastMessage: '新規作成に失敗しました',
    defaultErrorMessage:          '新規作成に失敗しました',
  });

  // - LlmChatRoom (MoreLoad)
  const handleLoadMoreLlmChatRoom = useCommonSubmit<void>({
    isSending,
    setIsSending,
    submitFunction: async () => {
      const nextPage = llmChatPage + 1;
      return await getLlmChatRoomSettingsRoomNameList({
        page: nextPage,
        size: pageSize,
      });
    },
    onSuccess: (result) => {
      setLlmChatItems([...(result.data as ItemBase[])]);
      setLlmChatPage((prev) => prev + 1);
    },
    defaultExceptionToastMessage: '読み込みエラー',
    defaultErrorMessage:          '読み込みエラー',
  });

  // - LlmChatRoom (RoomNameChange)
  const handleSubmitLlmChatRoomNameChange = useCommonSubmit<{roomId: string, newRoomName: string}>({
    isSending,
    setIsSending,
    // setErrorMsg,
    submitFunction: async ({roomId, newRoomName}) => {
      return await patchLlmChatRoomSettingsRoomNameChange({
        roomId,
        formData: {
          room_name: newRoomName,
        },
      });
    },
    onSuccess: async (_result, { roomId, newRoomName }) => {
      // モーダルを閉じる
      setLlmChatEditRoomNameModalOpen(false);
      // メニューの更新
      setLlmChatItems(prev => 
        prev.map(item => item.key === roomId ? { ...item, label: newRoomName } : item )
      );
      // roomId が現在のパスに含まれていたらサイドバーのタイトルも変更する
      const currentRoomId = pathname.split('/').pop();
      if (setSidebarTitle && currentRoomId === roomId) {
        setSidebarTitle(newRoomName);
      };
    },
    defaultExceptionToastMessage: '更新に失敗しました',
    defaultErrorMessage:          '更新に失敗しました',
  });

  // - LlmChatRoom (Delete)
  const handleSubmitLlmChatRoomDelete = useCommonSubmit<{roomId: string}>({
    isSending,
    setIsSending,
    submitFunction: async ({roomId}) => {
      return await llmChatDeleteRoom({roomId: roomId});
    },
    onSuccess: async (_result, { roomId }) => {
      // モーダルを閉じる
      setLlmChatDeleteRoomModalOpen(false);
      // メニューから削除
      setLlmChatItems(prev => prev.filter(item => item.key !== roomId));
      // roomId が現在のパスに含まれていたらリダイレクト
      const currentRoomId = pathname.split('/').pop();
      if (currentRoomId === roomId) {
        router.push(UrlToString(pagesPath.servicesPath.llmChat.$url()));
      };
    },
    defaultExceptionToastMessage: '削除に失敗しました',
    defaultErrorMessage:          '削除に失敗しました',
  });
  // LlmChatRoom coleback △

  // VrmChatRoom coleback ▽
  // - VrmChatRoom (EditModal)
  const handleOpenVrmChatEditRoomModal = useCallback(({roomId, currentName}: {roomId: string, currentName: string}) => {
    setEditRoomName(currentName);
    setEditRoomNameTargetRoomId(roomId);
    setVrmChatEditRoomNameModalOpen(true);
  }, []);
  // - VrmChatRoom (DeleteModal)
  const handleOpenVrmChatDeleteRoomModal = useCallback(({roomId}: {roomId: string}) => {
    setDeleteRoomTargetRoomId(roomId);
    setVrmChatDeleteRoomModalOpen(true);
  }, []);

  // - VrmChatRoom (Create)
  const handleCreateVrmChatRoom = useCommonSubmit<{setIsMobileMenuOpen?: Dispatch<SetStateAction<boolean>>}>({
    isSending,
    setIsSending,
    submitFunction: async () => {
      return await vrmChatCreateRoom();
    },
    onSuccess: (result, {setIsMobileMenuOpen}) => {
      const roomId = (result.data as { roomId: string }).roomId;
      // メニューに追加
      const newItem: ItemBase = {
        key:   roomId,
        label: 'NewVRMChatRoom',
        href:  roomId,
      };
      setVrmChatItems(prev => [newItem, ...prev]);
      // 新しい部屋にリダイレクト
      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
      router.push(UrlToString(pagesPath.servicesPath.vrmChatRoom.$url({_roomId: roomId})));
    },
    defaultExceptionToastMessage: '新規作成に失敗しました',
    defaultErrorMessage:          '新規作成に失敗しました',
  });

  // - VrmChatRoom (MoreLoad)
  const handleLoadMoreVrmChatRoom = useCommonSubmit<void>({
    isSending,
    setIsSending,
    submitFunction: async () => {
      const nextPage = vrmChatPage + 1;
      return await getVrmChatRoomSettingsRoomNameList({
        page: nextPage,
        size: pageSize,
      });
    },
    onSuccess: (result) => {
      setVrmChatItems([...(result.data as ItemBase[])]);
      setVrmChatPage((prev) => prev + 1);
    },
    defaultExceptionToastMessage: '読み込みエラー',
    defaultErrorMessage:          '読み込みエラー',
  });

  // - VrmChatRoom (RoomNameChange)
  const handleSubmitVrmChatRoomNameChange = useCommonSubmit<{roomId: string, newRoomName: string}>({
    isSending,
    setIsSending,
    // setErrorMsg,
    submitFunction: async ({roomId, newRoomName}) => {
      return await patchVrmChatRoomSettingsRoomNameChange({
        roomId,
        formData: {
          room_name: newRoomName,
        },
      });
    },
    onSuccess: async (_result, { roomId, newRoomName }) => {
      // モーダルを閉じる
      setVrmChatEditRoomNameModalOpen(false);
      // メニューの更新
      setVrmChatItems(prev => 
        prev.map(item => item.key === roomId ? { ...item, label: newRoomName } : item )
      );
      // roomId が現在のパスに含まれていたらサイドバーのタイトルも変更する
      const currentRoomId = pathname.split('/').pop();
      if (setSidebarTitle && currentRoomId === roomId) {
        setSidebarTitle(newRoomName);
      };
    },
    defaultExceptionToastMessage: '更新に失敗しました',
    defaultErrorMessage:          '更新に失敗しました',
  });

  // - VrmChatRoom (Delete)
  const handleSubmitVrmChatRoomDelete = useCommonSubmit<{roomId: string}>({
    isSending,
    setIsSending,
    // setErrorMsg,
    submitFunction: async ({roomId}) => {
      return await vrmChatDeleteRoom({roomId: roomId});
    },
    onSuccess: async (_result, { roomId }) => {
      // メニューから削除
      setVrmChatItems(prev => prev.filter(item => item.key !== roomId));
      // モーダルを閉じる
      setVrmChatDeleteRoomModalOpen(false);
      // roomId が現在のパスに含まれていたらリダイレクト
      const currentRoomId = pathname.split('/').pop();
      if (currentRoomId === roomId) {
        router.push(UrlToString(pagesPath.servicesPath.vrmChat.$url()));
      };
    },
    defaultExceptionToastMessage: '削除に失敗しました',
    defaultErrorMessage:          '削除に失敗しました',
  });
  // VrmChatRoom coleback △

  return {
    // --- 汎用状態 ---
    isSending, setIsSending,
    // --- LLM Chat ---
    llmChatItems,
    llmChatEditRoomNameModalOpen,
    setLlmChatEditRoomNameModalOpen,
    llmChatDeleteRoomModalOpen,
    setLlmChatDeleteRoomModalOpen,
    handleCreateLlmChatRoom,
    handleLoadMoreLlmChatRoom,
    handleOpenLlmChatDeleteRoomModal,
    handleOpenLlmChatEditRoomModal,
    handleSubmitLlmChatRoomNameChange,
    handleSubmitLlmChatRoomDelete,
    // --- VRM Chat ---
    vrmChatItems,
    vrmChatEditRoomNameModalOpen,
    setVrmChatEditRoomNameModalOpen,
    vrmChatDeleteRoomModalOpen,
    setVrmChatDeleteRoomModalOpen,
    handleCreateVrmChatRoom,
    handleLoadMoreVrmChatRoom,
    handleOpenVrmChatDeleteRoomModal,
    handleOpenVrmChatEditRoomModal,
    handleSubmitVrmChatRoomNameChange,
    handleSubmitVrmChatRoomDelete,
    // --- ルーム名編集/削除 ダイアログで使う共通状態 ---
    editRoomName,
    setEditRoomName,
    editRoomNametargetRoomId,
    setEditRoomNameTargetRoomId,
    deleteRoomTargetRoomId,
    setDeleteRoomTargetRoomId,
  };
};
// useChatRooms △