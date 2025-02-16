'use client'

// next
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
// react
import {
  useState,
  ComponentProps,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
} from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from '@/app/components/ui/shadcn/sidebar';
import { Separator } from '@/app/components/ui/shadcn/separator';
// icons
import {
  Layers,
} from 'lucide-react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import {
  createRoom                  as llmChatCreateRoom,
  getRoomSettingsRoomNameList as getLlmChatRoomSettingsRoomNameList,
} from '@/features/api/llmchat';
import {
  createRoom                  as vrmChatCreateRoom,
  getRoomSettingsRoomNameList as getVrmChatRoomSettingsRoomNameList,
} from '@/features/api/vrmchat';
import {
  patchRoomSettingsRoomNameChange  as patchLlmChatRoomSettingsRoomNameChange,
  roomSettingsRoomNameChangeSchema as llmChatRoomSettingsRoomNameChangeSchema,
  deleteRoom                       as llmChatDeleteRoom,
} from '@/features/api/llmchat';
import {
  patchRoomSettingsRoomNameChange  as patchVrmChatRoomSettingsRoomNameChange,
  roomSettingsRoomNameChangeSchema as vrmChatRoomSettingsRoomNameChangeSchema,
  deleteRoom                       as vrmChatDeleteRoom,
} from '@/features/api/vrmchat';
import { UrlToString } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// include
import { NavigationItems, type SubItem, type LoadItemDataProps } from '../data';
import { RoomNameChangeDialog, DeleteCheckDialog } from '../utils';
import { LlmChat, VrmChat } from './MenuContent';
// type
import type { ModalType } from './type.d';

// type
type SidebarBodyProps = {
  pageSize?:             number;
  setSidebarInsetTitle?: Dispatch<SetStateAction<string>>;
  } & LoadItemDataProps & ComponentProps<typeof Sidebar>;
export type MenuContentProps = {
  isSending:               boolean;
  items:                   SubItem[];
  handleLoadMoreItems:     (e: MouseEvent<HTMLElement>) => Promise<void>;
  handleCreateItem:        (e: MouseEvent<HTMLElement>) => Promise<void>;
  handleItemNameEditModal: (e: MouseEvent<HTMLElement>, id: string, currentName: string, modalType: ModalType) => void;
  handleDeleteItemModal:   (e: MouseEvent<HTMLElement>, id: string, modalType: ModalType) => void;
};

// SidebarBody ▽
export function SidebarBody({
  llmChatInitial,
  vrmChatInitial,
  pageSize,
  setSidebarInsetTitle,
  ...props }: SidebarBodyProps): ReactElement {

  const router   = useRouter();
  const pathname = usePathname();

  const [isSending, setIsSending]       = useState<boolean>(false);
  const [llmChatItems, setLlmChatItems] = useState<SubItem[]>(llmChatInitial ?? []);
  const [vrmChatItems, setVrmChatItems] = useState<SubItem[]>(vrmChatInitial ?? []);
  const [llmChatPage, setLlmChatPage]   = useState<number>(1);
  const [vrmChatPage, setVrmChatPage]   = useState<number>(1);

  const [editRoomName, setEditRoomName]                                 = useState<string>('');
  const [editRoomNametargetRoomId, setEditRoomNameTargetRoomId]         = useState<string>('');
  const [llmChatEditRoomNameModalOpen, setLlmChatEditRoomNameModalOpen] = useState<boolean>(false);
  const [vrmChatEditRoomNameModalOpen, setVrmChatEditRoomNameModalOpen] = useState<boolean>(false);

  const [deleteRoomTargetRoomId, setDeleteRoomTargetRoomId]         = useState<string>('');
  const [llmChatDeleteRoomModalOpen, setLlmChatDeleteRoomModalOpen] = useState<boolean>(false);
  const [vrmChatDeleteRoomModalOpen, setVrmChatDeleteRoomModalOpen] = useState<boolean>(false);


  // - handleRoomNameEditModal
  const handleRoomNameEditModal = (e: MouseEvent<HTMLElement>, roomId: string, currentName: string, modalType: ModalType): void => {
    e.stopPropagation();
    setEditRoomName(currentName);
    setEditRoomNameTargetRoomId(roomId);
    if (modalType === 'llmChat') {
      setLlmChatEditRoomNameModalOpen(true);
    } else if (modalType === 'vrmChat') {
      setVrmChatEditRoomNameModalOpen(true);
    };
  };
  // - VrmChatRoom (DeleteRoom)
  const handleDeleteRoomModal = (e: MouseEvent<HTMLElement>, roomId: string, modalType: ModalType): void => {
    e.stopPropagation();
    setDeleteRoomTargetRoomId(roomId);
    if (modalType === 'llmChat') {
      setLlmChatDeleteRoomModalOpen(true);
    } else if (modalType === 'vrmChat') {
      setVrmChatDeleteRoomModalOpen(true);
    };
  };
  // handles
  // - LlmChatRoom (Create)
  const handleCreateLlmChatRoom = async (e: MouseEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    try {
      const result = await llmChatCreateRoom();
      if (result.ok && result.data) {
        const roomId = result.data
        const newItem = [{
          key:   roomId,
          label: 'NewChatRoom',
          href:  roomId,
        }]
        // メニューに追加
        setLlmChatItems((prev) => [...newItem, ...prev]);
        // 新しい部屋にリダイレクト
        router.push(UrlToString(pagesPath.servicesPath.llmChatRoom.$url())+'/'+roomId);
      } else {
        showToast('error', 'error');
      };
    } catch {
      showToast('error', 'error');
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };
  // - VrmChatRoom (Create)
  const handleCreateVrmChatRoom = async (e: MouseEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    try {
      const result = await vrmChatCreateRoom();
      if (result.ok && result.data) {
        const roomId = result.data
        const newItem = [{
          key:   roomId,
          label: 'NewVRMChatRoom',
          href:  roomId,
        }]
        // メニューに追加
        setVrmChatItems((prev) => [...newItem, ...prev]);
        // 新しい部屋にリダイレクト
        router.push(UrlToString(pagesPath.servicesPath.vrmChatRoom.$url())+'/'+roomId);
      } else {
        showToast('error', 'error');
      };
    } catch {
      showToast('error', 'error');
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };
  // - LlmChatRoom (MoreLoad)
  const handleLoadMoreLlmChatRoom = async (e: MouseEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    try {
      const nextPage = llmChatPage + 1;
      const result   = await getLlmChatRoomSettingsRoomNameList(nextPage, pageSize ?? 0);
      if (result.ok && result.data) {
        setLlmChatItems([...(result.data ?? [])]);
        setLlmChatPage(nextPage);
      } else {
        //
      };
    } catch {
      //
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };
  // - VrmChatRoom (MoreLoad)
  const handleLoadMoreVrmChatRoom = async (e: MouseEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    try {
      const nextPage = vrmChatPage + 1;
      const result   = await getVrmChatRoomSettingsRoomNameList(nextPage, pageSize ?? 0);
      if (result.ok && result.data) {
        setVrmChatItems([...(result.data ?? [])]);
        setVrmChatPage(nextPage);
      } else {
        //
      };
    } catch {
      //
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };

  // - handleSubmitLlmChatRoomNameChange
  const handleSubmitLlmChatRoomNameChange = async (roomId: string, newRoomName: string) => {
    const result = await patchLlmChatRoomSettingsRoomNameChange({
      roomId:   roomId,
      formData: {
        room_name: newRoomName,
      },
    });
    if (result.ok) {
      // メニューに追加
      setLlmChatItems((prev) =>
        prev.map((item) =>
          item.key === roomId
            ? { ...item, label: newRoomName }
            : item
        )
      );
      // editRoomNametargetRoomId が現在のパスに含まれていたらサイドバーのタイトルも変更する
      const currentRoomId = pathname.split('/').pop();
      if (setSidebarInsetTitle && currentRoomId === editRoomNametargetRoomId) {
        setSidebarInsetTitle(editRoomName);
      };
    } else {
      throw new Error('failed');
    };
  };
  // - handleSubmitVrmChatRoomNameChange
  const handleSubmitVrmChatRoomNameChange = async (roomId: string, newRoomName: string) => {
    const result = await patchVrmChatRoomSettingsRoomNameChange({
      roomId:   roomId,
      formData: {
        room_name: newRoomName,
      },
    });
    if (result.ok) {
      // メニューに追加
      setVrmChatItems((prev) =>
        prev.map((item) =>
          item.key === roomId
            ? { ...item, label: newRoomName }
            : item
        )
      );
      // editRoomNametargetRoomId が現在のパスに含まれていたらサイドバーのタイトルも変更する
      const currentRoomId = pathname.split('/').pop();
      if (setSidebarInsetTitle && currentRoomId === editRoomNametargetRoomId) {
        setSidebarInsetTitle(editRoomName);
      };
    } else {
      throw new Error('failed');
    };
  };
  // - handleSubmitLlmChatRoomDelete
  const handleSubmitLlmChatRoomDelete = async (roomId: string) => {
    const result = await llmChatDeleteRoom(roomId);
    if (result.ok) {
      // メニューから削除
      setLlmChatItems((prev) => prev.filter((item) => item.key !== deleteRoomTargetRoomId));
      // deleteRoomTargetRoomId が現在のパスに含まれていたらリダイレクト
      const currentRoomId = pathname.split('/').pop();
      if (currentRoomId === deleteRoomTargetRoomId) {
        router.push(
          UrlToString(pagesPath.servicesPath.llmChat.$url())
        );
      };
    } else {
      throw new Error('failed');
    };
  };
  // - handleSubmitVrmChatRoomDelete
  const handleSubmitVrmChatRoomDelete = async (roomId: string) => {
    const result = await vrmChatDeleteRoom(roomId);
    if (result.ok) {
      // メニューから削除
      setVrmChatItems((prev) => prev.filter((item) => item.key !== deleteRoomTargetRoomId));
      // deleteRoomTargetRoomId が現在のパスに含まれていたらリダイレクト
      const currentRoomId = pathname.split('/').pop();
      if (currentRoomId === deleteRoomTargetRoomId) {
        router.push(
          UrlToString(pagesPath.servicesPath.vrmChat.$url())
        );
      };
    } else {
      throw new Error('failed');
    };
  };

  return (
    <Sidebar {...props} >
      <SidebarHeader></SidebarHeader>
      <SidebarContent className='gap-0'>

        {/* Dash Board */}
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className={cn(
              'group/label',
              'text-sm text-sidebar-foreground',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={pagesPath.servicesPath.dashBoard.$url()}>
                      <Layers className='size-4' />Dash Board
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* LLM Chat */}
        <LlmChat isSending               = {isSending}
                 items                   = {llmChatItems}
                 handleLoadMoreItems     = {handleLoadMoreLlmChatRoom}
                 handleCreateItem        = {handleCreateLlmChatRoom}
                 handleItemNameEditModal = {handleRoomNameEditModal}
                 handleDeleteItemModal   = {handleDeleteRoomModal} />

        {/* VRM Chat */}
        <VrmChat isSending               = {isSending}
                 items                   = {vrmChatItems}
                 handleLoadMoreItems     = {handleLoadMoreVrmChatRoom}
                 handleCreateItem        = {handleCreateVrmChatRoom}
                 handleItemNameEditModal = {handleRoomNameEditModal}
                 handleDeleteItemModal   = {handleDeleteRoomModal} />

      </SidebarContent>

      {/* Footer */}
      <Separator className='mt-4' />
      <SidebarFooter>
        <SidebarContent className='gap-0'>
          { NavigationItems.SidebarFooter.map((item) => {
            return (
              <SidebarGroup key={item.key} className='p-1'>
                <SidebarGroupContent>
                  <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild size="sm">
                          <Link href={item.href ?? '#'}>
                            {item.icon && <item.icon />}{item.label}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>
        <p className='font-mono text-xs text-slate-400 select-none'>&copy; 2024 K.Mitsuhiro</p>
      </SidebarFooter>
      <SidebarRail className='hover:after:bg-transpant' />

      {/* RoomNameChangeDialog */}
      <RoomNameChangeDialog onSubmit                 = {handleSubmitLlmChatRoomNameChange}
                            isSending                = {isSending}
                            setIsSending             = {setIsSending}
                            roomNameSchema           = {llmChatRoomSettingsRoomNameChangeSchema}
                            editRoomName             = {editRoomName}
                            setEditRoomName          = {setEditRoomName}
                            editRoomNametargetRoomId = {editRoomNametargetRoomId}
                            modalOpen                = {llmChatEditRoomNameModalOpen}
                            setModalOpen             = {setLlmChatEditRoomNameModalOpen} />
      <RoomNameChangeDialog onSubmit                 = {handleSubmitVrmChatRoomNameChange}
                            isSending                = {isSending}
                            setIsSending             = {setIsSending}
                            roomNameSchema           = {vrmChatRoomSettingsRoomNameChangeSchema}
                            editRoomName             = {editRoomName}
                            setEditRoomName          = {setEditRoomName}
                            editRoomNametargetRoomId = {editRoomNametargetRoomId}
                            modalOpen                = {vrmChatEditRoomNameModalOpen}
                            setModalOpen             = {setVrmChatEditRoomNameModalOpen} />
      {/* DeleteCheckDialog */}
      <DeleteCheckDialog onDelete               = {handleSubmitLlmChatRoomDelete}
                         isSending              = {isSending}
                         setIsSending           = {setIsSending}
                         deleteRoomTargetRoomId = {deleteRoomTargetRoomId}
                         modalOpen              = {llmChatDeleteRoomModalOpen}
                         setModalOpen           = {setLlmChatDeleteRoomModalOpen}/>
      <DeleteCheckDialog onDelete               = {handleSubmitVrmChatRoomDelete}
                         isSending              = {isSending}
                         setIsSending           = {setIsSending}
                         deleteRoomTargetRoomId = {deleteRoomTargetRoomId}
                         modalOpen              = {vrmChatDeleteRoomModalOpen}
                         setModalOpen           = {setVrmChatDeleteRoomModalOpen}/>

    </Sidebar>
  )
};
// SidebarBody △