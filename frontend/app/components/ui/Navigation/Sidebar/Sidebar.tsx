'use client'

// next
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// react
import {
  useState,
  ComponentProps,
  type ReactElement,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/components/ui/shadcn/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/shadcn/dropdown-menu';
import { Button } from '@/app/components/ui/shadcn/button';
import { Separator } from '@/app/components/ui/shadcn/separator';
// icons
import {
  Loader2,
  ChevronRight,
  Layers,
  MessageCircleMore,
  AudioLines,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { UrlToString } from '@/features/utils';
import { createRoom, getRoomSettingsRoomNameList } from '@/features/api/vrmchat';
// components
import { showToast } from '@/app/components/utils';
// include
import { NavigationItems, type SubItem, type LoadItemDataProps } from '../data';
import { RoomNameChangeDialog, DeleteCheckDialog } from '../utils';

// type
type SidebarBodyProps = {
  pageSize?: number;
  } & LoadItemDataProps & ComponentProps<typeof Sidebar>;

// SidebarBody ▽
export function SidebarBody({ vrmChatInitial, pageSize,  ...props }: SidebarBodyProps): ReactElement {

  const router                          = useRouter();
  const [vrmChatItems, setVrmChatItems] = useState<SubItem[]>(vrmChatInitial ?? []);
  const [vrmChatPage, setVrmChatPage]   = useState<number>(1);
  const [editRoomName, setEditRoomName]                         = useState<string>('');
  const [editRoomNametargetRoomId, setEditRoomNameTargetRoomId] = useState<string>('');
  const [editRoomNameModalOpen, setEditRoomNameModalOpen]       = useState<boolean>(false);
  const [deleteRoomTargetRoomId, setDeleteRoomTargetRoomId]     = useState<string>('');
  const [deleteRoomModalOpen, setDeleteRoomModalOpen]           = useState<boolean>(false);
  const [isVrmChatRoomSending, setIsVrmChatRoomSending]         = useState<boolean>(false);

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
  const handleLoadMoreVrmChatRoom = async (e: MouseEvent<HTMLElement>): Promise<void> => {
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
    e.stopPropagation();
    setEditRoomName(currentName);
    setEditRoomNameTargetRoomId(roomId);
    setEditRoomNameModalOpen(true);
  };
  const handleDeleteRoomModal = (e: MouseEvent<HTMLElement>, roomId: string): void => {
    e.stopPropagation();
    setDeleteRoomTargetRoomId(roomId);
    setDeleteRoomModalOpen(true);
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
                    <Link href='#'>
                      <MessageCircleMore className='size-4' />LLM Chat(未作成)
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* VRM Chat */}
        <Collapsible title     = 'VRM Chat'
                     className = 'group/collapsible'
                     defaultOpen >
          <SidebarGroup>
            <SidebarGroupLabel asChild
                               className={cn(
                                'group/label',
                                'text-sm text-sidebar-foreground',
                                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',)}>
              <CollapsibleTrigger>
                <AudioLines className='mx-2 size-4' />VRM Chat
                <ChevronRight className={cn(
                  'ml-auto transition-transform',
                  'group-data-[state=open]/collapsible:rotate-90',)} />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className='ml-2'>
                  <Button size      = 'sm'
                          className = 'my-2 me-4 p-2 text-xs font-normal'
                          disabled  = {isVrmChatRoomSending}
                          onClick   = {handleCreateVrmChatRoom}>
                        {isVrmChatRoomSending ? <Loader2 className='size-4 animate-spin' /> : '新しい会話を始める'}
                  </Button>
                  { vrmChatItems && vrmChatItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.key}>
                      <div className='flex w-full items-center justify-between'>
                        <SidebarMenuButton className='truncate' asChild>{/* isActive={subItem.isActive}> */}
                          <Link href={UrlToString(pagesPath.servicesPath.vrmChatRoom.$url({_roomId:subItem.href}))}>
                            {subItem.label}
                          </Link>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <MoreVertical className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={(e: MouseEvent<HTMLElement>) => {handleRoomNameEditModal(e, subItem.key, subItem.label);}} >
                              <Pencil />タイトル変更
                            </DropdownMenuItem>
                            <DropdownMenuItem className={cn(
                              'text-destructive',
                              'hover:bg-destructive hover:text-destructive-foreground',
                              'focus:bg-destructive focus:text-destructive-foreground',)}
                                              onClick={(e: MouseEvent<HTMLElement>) => {handleDeleteRoomModal(e, subItem.key);}} >
                              <Trash2 />削除する
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuItem>
                  ))}
                  <Button variant   = 'ghost'
                          className = 'mt-3 text-xs text-foreground/60'
                          disabled  = {isVrmChatRoomSending}
                          onClick   = {handleLoadMoreVrmChatRoom}>
                        {isVrmChatRoomSending ? <Loader2 className='size-4 animate-spin' /> : 'もっと見る'}
                  </Button>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

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
        <p className='font-mono text-xs text-slate-400'>&copy; 2024 K.Mitsuhiro</p>
      </SidebarFooter>
      <SidebarRail className='hover:after:bg-transpant' />

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

    </Sidebar>
  )
};
// SidebarBody △