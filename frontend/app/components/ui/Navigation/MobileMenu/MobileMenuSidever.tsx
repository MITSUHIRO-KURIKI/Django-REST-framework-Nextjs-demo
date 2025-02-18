// https://github.com/shadcn-ui/ui/discussions/1790#discussioncomment-7348150
'use client';

// next
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
// react
import {
  useState,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
} from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// shadcn/ui
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import {
  Menu,
  ChevronRight,
  ChevronLeft,
  AudioLines,
  Layers,
} from 'lucide-react';
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
import { ThemeToggle, Loader } from '@/app/components/ui/common';
import { showToast } from '@/app/components/utils';
// include
import { MobileMenuBase } from './MobileMenuBase';
import { AccountSettingsModal } from '../AccountSettingsModal';
import { RoomNameChangeDialog, DeleteCheckDialog } from '../utils';
import { AccountMenuItems, type SubItem, type LoadItemDataProps } from '../data';
import { LlmChat, VrmChat } from './SubCategoryPage';
// type
import { SubCategoryPage } from './type.d';

// type
type MobileMenuProps = {
  setIsNavVisible:      Dispatch<SetStateAction<boolean>>;
  pageSize?:            number;
} & LoadItemDataProps;
export type SubCategoryPageProps = {
  setIsMobileMenuOpen:     Dispatch<SetStateAction<boolean>>;
  isSending:               boolean;
  items:                   SubItem[];
  handleLoadMoreItems:     (e: MouseEvent<HTMLElement>) => Promise<void>;
  handleCreateItem:        (e: MouseEvent<HTMLElement>) => Promise<void>;
  handleItemNameEditModal: (e: MouseEvent<HTMLElement>, roomId: string, currentName: string) => void;
  handleDeleteItemModal:   (e: MouseEvent<HTMLElement>, roomId: string) => void;
};


// MobileMenuSidever ▽
export function MobileMenuSidever({
  llmChatInitial,
  vrmChatInitial,
  setIsNavVisible,
  pageSize, }: MobileMenuProps): ReactElement {

  // accountMenu
  const accountMenuItems = AccountMenuItems();
  // モバイルメニュー
  const [currentSubCategoryPage, setCurrentSubCategoryPage] = useState<SubCategoryPage>(null);
  const [isSubCategoryOpen, setIsSubCategoryOpen]           = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen]             = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen]         = useState(false);
  const [overlayActive, setOverlayActive]                   = useState<boolean>(false);

  // バックエンド問い合わせ
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

  // handleVrmChatCategoryClick
  const handleVrmChatCategoryClick = (e: MouseEvent<HTMLElement>, subCategoryPageName: SubCategoryPage): void => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSubCategoryPage(subCategoryPageName);
    setIsSubCategoryOpen(true);
  };
  // handleGoBack
  const handleGoBack = (e: MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubCategoryOpen(false);
  };
  // - handleRoomNameEditModal
  const handleRoomNameEditModal = (e: MouseEvent<HTMLElement>, roomId: string, currentName: string): void => {
    e.stopPropagation();
    setEditRoomName(currentName);
    setEditRoomNameTargetRoomId(roomId);
    if (currentSubCategoryPage === 'llmChat') {
      setLlmChatEditRoomNameModalOpen(true);
    } else if (currentSubCategoryPage === 'vrmChat') {
      setVrmChatEditRoomNameModalOpen(true);
    };
  };
  // - VrmChatRoom (DeleteRoom)
  const handleDeleteRoomModal = (e: MouseEvent<HTMLElement>, roomId: string): void => {
    e.stopPropagation();
    setDeleteRoomTargetRoomId(roomId);
    if (currentSubCategoryPage === 'llmChat') {
      setLlmChatDeleteRoomModalOpen(true);
    } else if (currentSubCategoryPage === 'vrmChat') {
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
        // メニュー閉じる
        setIsMobileMenuOpen(false);
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
        // メニュー閉じる
        setIsMobileMenuOpen(false);
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
    <>
      <Button variant   = 'ghost'
              size      = 'icon'
              className = 'md:hidden [&_svg]:size-6'
              onClick   = {() => setIsMobileMenuOpen(true)}>
        <Menu />
        <span className='sr-only'>Toggle menu</span>
      </Button>

      <MobileMenuBase isMobileMenuOpen    = {isMobileMenuOpen}
                      setIsMobileMenuOpen = {setIsMobileMenuOpen}
                      overlayActive       = {overlayActive}
                      setIsNavVisible     = {setIsNavVisible}>

        {/* メインカテゴリ画面 */}
        <div className={cn(
          'absolute top-0 left-0 size-full transition-transform',
          'duration-500', "ease-[cubic-bezier(0.32,0.72,0,1)]",
          !isSubCategoryOpen ? 'translate-x-0' : '-translate-x-full',)}>
          <div>
            <ul className='w-full space-y-2 pr-8'>
              {/* Dash Board */}
              <Link href      = {pagesPath.servicesPath.dashBoard.$url()}
                    className = {cn(
                      'gap-2 flex w-full h-8 justify-start items-center rounded',
                      'text-sm font-normal text-foreground [&>svg]:text-sidebar-accent-foreground',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground select-none',
                      '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                    onClick={() => setIsMobileMenuOpen(false)} >
                <Layers className='size-4' />Dash Board
              </Link>

              {/* LLM Chat */}
              <Button variant   = 'link'
                      size      = 'fit'
                      className = {cn(
                        'w-full h-8 justify-start rounded',
                        'text-sm font-normal text-foreground',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                      onClick={(e: MouseEvent<HTMLElement>) => handleVrmChatCategoryClick(e, 'llmChat')}>
                  <AudioLines />LLM Chat
                  <ChevronRight className='text-foreground' />
              </Button>

              {/* VRM Chat */}
              <Button variant   = 'link'
                      size      = 'fit'
                      className = {cn(
                        'w-full h-8 justify-start rounded',
                        'text-sm font-normal text-foreground',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                      onClick={(e: MouseEvent<HTMLElement>) => handleVrmChatCategoryClick(e, 'vrmChat')}>
                  <AudioLines />VRM Chat
                  <ChevronRight className='text-foreground' />
              </Button>
            </ul>

            <div className={cn(
              'mt-6 mb-2 mr-8 ml-0',
              'h-[1px] w-auto rounded-full bg-border',)} />

            {/* accountMenuItems */}
            <div className='w-full space-y-2 pr-8'>
              {accountMenuItems.map((item) => {
                if (item.key === 'loading') {
                  return <div key={item.key}><Loader /></div>;
                };
                if (item.type === 'action' && item.onClick) {
                  return (
                    <Button variant   = 'link'
                            size      = 'fit'
                            key       = {item.key}
                            onClick   = {() => {
                              setOverlayActive(true);
                              if (item.onClick) {item.onClick();}
                            }}
                            className = {cn(
                              'w-full h-8 justify-start rounded',
                              'text-sm font-normal text-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}>
                      {item.icon && <item.icon />}{item.label}
                    </Button>
                  );
                };
                if (item.key === 'settings') {
                  return (
                    <Button variant   = 'link'
                            size      = 'fit'
                            key       = {item.key}
                            onClick   = {() => {
                              setIsMobileMenuOpen(false);
                              setIsAccountModalOpen(true);
                            }} 
                            className = {cn(
                              'w-full h-8 justify-start rounded',
                              'text-sm font-normal text-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}>
                      {item.icon && <item.icon />}{item.label}
                    </Button>
                  );
                };
                return (
                  <Link key       = {item.key}
                        href      = {item.href ?? '#'}
                        className = {cn(
                          'flex gap-2 w-full h-8 justify-start items-center rounded',
                          'text-sm font-normal text-foreground select-none',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                        onClick={() => setIsMobileMenuOpen(false)} >
                    {item.icon && <item.icon />}{item.label}
                  </Link>
                );
              })}

              {/* ThemeToggle */}
              <div className = {cn(
                'relative flex justify-between cursor-default select-none items-center gap-2 ',
                'text-xs font-light text-foreground text-left',
                'outline-none',
              )}>
                <span>Appearance</span>
                <ThemeToggle />
              </div>

            </div>
          </div>
        </div>

        {/* サブカテゴリ画面 */}
        <div className={cn(
          'absolute top-0 left-0 size-full transition-transform',
          'duration-500', "ease-[cubic-bezier(0.32,0.72,0,1)]",
          isSubCategoryOpen ? 'translate-x-0' : 'translate-x-full',)} >
            <Button variant   ='ghost'
                    size      = 'xs'
                    className = {cn(
                      'justify-start rounded',
                      'text-xs text-foreground/60',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      '[&>svg]:text-foreground/60 hover:[&>svg]:text-sidebar-accent-foreground',)}
                    onClick = {(e: MouseEvent<HTMLElement>,) => handleGoBack(e)}>
              <ChevronLeft />
              <span>back</span>
            </Button>
            <div className='space-y-4 pt-4'>
              {/* サブカテゴリ ▽ */}
                {currentSubCategoryPage === 'llmChat'
                  && <LlmChat setIsMobileMenuOpen     = {setIsMobileMenuOpen}
                              isSending               = {isSending}            
                              items                   = {llmChatItems}
                              handleLoadMoreItems     = {handleLoadMoreLlmChatRoom}
                              handleCreateItem        = {handleCreateLlmChatRoom}
                              handleItemNameEditModal = {handleRoomNameEditModal}
                              handleDeleteItemModal   = {handleDeleteRoomModal} />}
                {currentSubCategoryPage === 'vrmChat'
                  && <VrmChat setIsMobileMenuOpen     = {setIsMobileMenuOpen}
                              isSending               = {isSending}
                              items                   = {vrmChatItems}
                              handleLoadMoreItems     = {handleLoadMoreVrmChatRoom}
                              handleCreateItem        = {handleCreateVrmChatRoom}
                              handleItemNameEditModal = {handleRoomNameEditModal}
                              handleDeleteItemModal   = {handleDeleteRoomModal} />}
                {!currentSubCategoryPage
                  && <></>}
              {/* サブカテゴリ △ */}
          </div>
        </div>
      </MobileMenuBase>

      {/* アカウント設定 モーダル */}
      <AccountSettingsModal open         = {isAccountModalOpen}
                            onOpenChange = {setIsAccountModalOpen} />

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
    </>
  );
};
// MobileMenu △