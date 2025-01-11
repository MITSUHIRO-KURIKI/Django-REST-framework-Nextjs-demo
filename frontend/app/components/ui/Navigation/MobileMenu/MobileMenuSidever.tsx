// https://github.com/shadcn-ui/ui/discussions/1790#discussioncomment-7348150
'use client';

// next
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// react
import {
  useState,
  useEffect,
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/app/components/ui/shadcn/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/shadcn/dropdown-menu';
// icons
import {
  Menu,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AudioLines,
  MessageCircleMore,
  Layers,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
// features
import { UrlToString } from '@/features/utils';
import { createRoom, getRoomSettingsRoomNameList } from '@/features/api/vrmchat';
// components
import { Loader } from '@/app/components/ui/common';
import { showToast, OverlaySpinner } from '@/app/components/utils';
// include
import { AccountMenuItems, type SubItem, type LoadItemDataProps } from '../data';
import { RoomNameChangeDialog, DeleteCheckDialog } from '../utils';

// type
type MobileMenuProps = {
  setIsNavVisible: Dispatch<SetStateAction<boolean>>;
  pageSize?:       number;
} & LoadItemDataProps;

// MobileMenuSidever ▽
export function MobileMenuSidever({ setIsNavVisible, vrmChatInitial, pageSize }: MobileMenuProps): ReactElement {

  // accountMenu
  const accountMenuItems = AccountMenuItems();
  // モバイルメニュー
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen]   = useState<boolean>(false);
  const [overlayActive, setOverlayActive]         = useState<boolean>(false);

  // バックエンド問い合わせ
  const router                                                  = useRouter();
  const [vrmChatItems, setVrmChatItems]                         = useState<SubItem[]>(vrmChatInitial ?? []);
  const [vrmChatPage, setVrmChatPage]                           = useState<number>(1);
  const [editRoomName, setEditRoomName]                         = useState<string>('');
  const [editRoomNametargetRoomId, setEditRoomNameTargetRoomId] = useState<string>('');
  const [editRoomNameModalOpen, setEditRoomNameModalOpen]       = useState<boolean>(false);
  const [deleteRoomTargetRoomId, setDeleteRoomTargetRoomId]     = useState<string>('');
  const [deleteRoomModalOpen, setDeleteRoomModalOpen]           = useState<boolean>(false);
  const [isVrmChatRoomSending, setIsVrmChatRoomSending]         = useState<boolean>(false);

  // handleVrmChatCategoryClick
  const handleVrmChatCategoryClick = (e: MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubCategoryOpen(true);
  };
  // handleGoBack
  const handleGoBack = (e: MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubCategoryOpen(false);
  };

  // handles
  // - VrmChatRoom
  const handleCreateVrmChatRoom = async (e: MouseEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    // 多重送信防止
    if (isVrmChatRoomSending) return;

    setIsVrmChatRoomSending(true);
    try {
      const result = await createRoom();
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
      setIsVrmChatRoomSending(false);
    };
  };
  const handleLoadMoreVrmChatRoom = async (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 多重送信防止
    if (isVrmChatRoomSending) return;

    setIsVrmChatRoomSending(true);
    try {
      const nextPage = vrmChatPage + 1;
      const result   = await getRoomSettingsRoomNameList(nextPage, pageSize ?? 0);
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
      setIsVrmChatRoomSending(false);
    };
  };
  const handleRoomNameEditModal = (e: MouseEvent<HTMLElement>, roomId: string, currentName: string): void => {
    e.preventDefault();
    e.stopPropagation();
    setEditRoomName(currentName);
    setEditRoomNameTargetRoomId(roomId);
    setEditRoomNameModalOpen(true);
  };
  const handleDeleteRoomModal = (e: MouseEvent<HTMLElement>, roomId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteRoomTargetRoomId(roomId);
    setDeleteRoomModalOpen(true);
  };

  // contentScale
  useEffect(() => {
    const wrapContent        = document.getElementById('navbarWrapContent');
    const contentScale       = 0.9;
    const contentScaleOffset = 60; // px
    if (!wrapContent) return;
    if (isMobileMenuOpen) {
      setIsNavVisible(false);
      wrapContent.style.setProperty('--contentScale', `${contentScale}`);
      wrapContent.style.setProperty('--offsetYValue', `${window.scrollY * (1 - contentScale) - contentScaleOffset}px`);
      wrapContent.classList.add(
        'scale-[var(--contentScale)]',
        'translate-y-[var(--offsetYValue)]',
      );
    } else {
      setIsNavVisible(true);
      wrapContent.classList.remove(
        'scale-[var(--contentScale)]',
        'translate-y-[var(--offsetYValue)]',
      );
    };
  }, [isMobileMenuOpen, setIsNavVisible]);

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      {/* SheetTrigger */}
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Menu className='size-6' />
          <span className='sr-only'>Toggle menu</span>
        </Button>
      </SheetTrigger>

      {/* SheetContent */}
      <SheetContent side='bottom'
                    className={cn(
                      'h-[60svh] overflow-y-auto rounded-t-golden-phi',
                      'bg-sidebar invisible-scrollbar',
                      'pt-8 pb-8 pr-0 pl-8',)}>

        {/* OverlaySpinner */}
        <OverlaySpinner isActivate={overlayActive} />

        <SheetTitle className='sr-only'>
          Mobile Navigation Menu
        </SheetTitle>
        <SheetDescription className='sr-only'>
          Navigation menu for mobile display
        </SheetDescription>
        <div className='absolute left-1/2 top-0 mt-4 h-px w-8 -translate-x-1/2 rounded-full bg-border' />
        <div className='relative size-full overflow-x-hidden'>
          {/* メインカテゴリ画面 */}
          <div className={cn(
            'absolute top-0 left-0 size-full transition-transform',
            'duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
            !isSubCategoryOpen ? 'translate-x-0' : '-translate-x-full',)}>
            <div>
              <ul className='w-full space-y-2 pr-8'>
                {/* Dash Board */}
                <Link href      = {pagesPath.servicesPath.dashBoard.$url()}
                      className = {cn(
                        'gap-2 flex w-full h-8 justify-start items-center rounded',
                        'text-sm font-normal text-foreground [&>svg]:text-sidebar-accent-foreground',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                      onClick={() => setIsMobileMenuOpen(false)} >
                  <Layers className='size-4' />Dash Board
                </Link>

                {/* LLM Chat */}
                <Link href      = '#'
                      className = {cn(
                        'gap-2 flex w-full h-8 justify-start items-center rounded',
                        'text-sm font-normal text-foreground [&>svg]:text-sidebar-accent-foreground',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                      onClick={() => setIsMobileMenuOpen(false)} >
                  <MessageCircleMore className='size-4' />LLM Chat(未作成)
                </Link>

                {/* VRM Chat */}
                <Button variant   = 'link'
                        size      = 'fit'
                        className = {cn(
                          'w-full h-8 justify-start rounded',
                          'text-sm font-normal text-foreground',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                        onClick={(e: MouseEvent<HTMLElement>) => handleVrmChatCategoryClick(e)}>
                    <AudioLines className='size-4' />VRM Chat
                    <ChevronRight className='size-4 text-foreground' />
                </Button>
              </ul>

              <div className={cn(
                'mt-8 mb-4 mr-8 ml-0',
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
                              onClick   = {()=>{
                                setOverlayActive(true);
                                if (item.onClick) {item.onClick();}
                              }}
                              className = {cn(
                                'w-full h-8 justify-start rounded',
                                'text-sm font-normal text-foreground',
                                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}>
                        {item.icon && <item.icon className='size-4' />}{item.label}
                      </Button>
                    );
                  };
                  return (
                    <Link key       = {item.key}
                          href      = {item.href ?? '#'}
                          className = {cn(
                            'flex gap-2 w-full h-8 justify-start items-center rounded',
                            'text-sm font-normal text-foreground',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                          onClick={() => setIsMobileMenuOpen(false)} >
                      {item.icon && <item.icon className='size-4' />}{item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* サブカテゴリ画面 */}
          <div className={cn(
            'absolute top-0 left-0 size-full transition-transform',
            'duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
            isSubCategoryOpen ? 'translate-x-0' : 'translate-x-full',)} >
              <Button variant ='ghost'
                      size    = 'xs'
                      className = {cn(
                        'justify-start rounded',
                        'text-xs text-foreground/60',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        '[&>svg]:text-foreground/60 hover:[&>svg]:text-sidebar-accent-foreground',)}
                      onClick = {(e: MouseEvent<HTMLElement>,) => handleGoBack(e)}>
                <ChevronLeft className='size-4' />
                <span>back</span>
              </Button>
              <div className='space-y-4 pt-4'>
                {/* サブカテゴリ ▽ */}
                <div className={cn(
                  'flex gap-2 mb-2 justify-start items-center',
                  'text-xs font-light text-foreground',
                  '[&>svg]:text-foreground',)}>
                  VRM Chat
                </div>
                <Button size      = 'sm'
                        className = 'absolute right-4 top-4 text-xs'
                        disabled  = {isVrmChatRoomSending}
                        onClick   = {handleCreateVrmChatRoom}>
                        {isVrmChatRoomSending ? <Loader2 className='mr-2 size-4 animate-spin' /> : '新しい会話を始める'}
                </Button>
                <ul className='ml-2 w-full space-y-2 pr-8'>
                  { vrmChatItems.map((subItem) => (
                    <li key={subItem.key}>
                      <div className='flex w-full items-center justify-between'>
                        <Link href      = {UrlToString(pagesPath.servicesPath.vrmChatRoom.$url())+'/'+subItem.href}
                              className = {cn(
                                'flex w-full h-8 justify-start items-center rounded',
                                'text-sm font-normal text-foreground',
                                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',)}
                              onClick={() => setIsMobileMenuOpen(false)} >
                          {subItem.label}
                        </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreVertical className='size-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={(e: MouseEvent<HTMLElement>,) => {handleRoomNameEditModal(e, subItem.key, subItem.label);}} >
                                <Pencil />タイトル変更
                              </DropdownMenuItem>
                              <DropdownMenuItem className={cn(
                                'text-destructive',
                                'hover:bg-destructive hover:text-destructive-foreground',
                                'focus:bg-destructive focus:text-destructive-foreground',)}
                                                onClick={(e: MouseEvent<HTMLElement>,) => {handleDeleteRoomModal(e, subItem.key);}} >
                                <Trash2 />削除する
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant   = 'ghost'
                        className = 'mt-3 text-xs text-foreground/60'
                        disabled  = {isVrmChatRoomSending}
                        onClick   = {handleLoadMoreVrmChatRoom}>
                        {isVrmChatRoomSending ? <Loader2 className='mr-2 size-4 animate-spin' /> : 'もっと見る'}
                </Button>
                {/* サブカテゴリ △ */}
            </div>
          </div>
        </div>
      </SheetContent>

      {/* RoomNameChangeDialog */}
      <RoomNameChangeDialog setVrmChatItems          = {setVrmChatItems}
                            isVrmChatRoomSending     = {isVrmChatRoomSending}
                            setIsVrmChatRoomSending  = {setIsVrmChatRoomSending}
                            editRoomName             = {editRoomName}
                            setEditRoomName          = {setEditRoomName}
                            editRoomNametargetRoomId = {editRoomNametargetRoomId}
                            editRoomNameModalOpen    = {editRoomNameModalOpen}
                            setEditRoomNameModalOpen = {setEditRoomNameModalOpen}/>
      {/* DeleteCheckDialog */}
      <DeleteCheckDialog setVrmChatItems         = {setVrmChatItems}
                         isVrmChatRoomSending    = {isVrmChatRoomSending}
                         setIsVrmChatRoomSending = {setIsVrmChatRoomSending}
                         deleteRoomTargetRoomId  = {deleteRoomTargetRoomId}
                         deleteRoomModalOpen     = {deleteRoomModalOpen}
                         setDeleteRoomModalOpen  = {setDeleteRoomModalOpen}/>
    </Sheet>
  );
};
// MobileMenu △