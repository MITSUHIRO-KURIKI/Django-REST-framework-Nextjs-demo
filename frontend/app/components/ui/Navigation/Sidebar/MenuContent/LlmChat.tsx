'use client';

// next
import Link from 'next/link';
// react
import {
  type ReactElement,
  type MouseEvent,
} from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// shadcn/ui
import { cn } from '@/app/components/lib/shadcn';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
// icons
import {
  Loader2,
  ChevronRight,
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
// features
import { UrlToString } from '@/features/utils';
// type
import type { MenuContentProps } from '../Sidebar';


// LlmChat ▽
export function LlmChat({
  isSending,
  items,
  handleLoadMoreItems,
  handleCreateItem,
  handleItemNameEditModal,
  handleDeleteItemModal, }: MenuContentProps): ReactElement {

  return (
    <Collapsible title     = 'LLM Chat'
                 className = 'group/collapsible'
                 defaultOpen >
      <SidebarGroup>
        <SidebarGroupLabel asChild
                           className={cn(
                            'group/label',
                            'text-sm text-sidebar-foreground',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          )}>
          <CollapsibleTrigger>
            <MessageCircleMore className='mx-2 size-4' />LLM Chat
            <ChevronRight className={cn(
                            'ml-auto transition-transform',
                            'group-data-[state=open]/collapsible:rotate-90',
                          )} />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu className='ml-2'>

              <Button size      = 'sm'
                      className = 'my-2 me-4 p-2 text-xs font-normal'
                      disabled  = {isSending}
                      onClick   = {handleCreateItem}>
                {isSending ? <Loader2 className='animate-spin' /> : '新しい部屋を作成する'}
              </Button>

              { items && items.map((subItem) => (
                <SidebarMenuItem key={subItem.key}>
                  <div className='flex w-full items-center justify-between'>
                    <SidebarMenuButton className='truncate' asChild>{/* isActive={subItem.isActive}> */}
                      <Link href={UrlToString(pagesPath.servicesPath.llmChatRoom.$url({_roomId:subItem.href}))}>
                        {subItem.label}
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={(e: MouseEvent<HTMLElement>) => {handleItemNameEditModal(e, subItem.key, subItem.label, 'llmChat');}} >
                          <Pencil />タイトル変更
                        </DropdownMenuItem>
                        <DropdownMenuItem className={cn(
                          'text-destructive',
                          'hover:bg-destructive hover:text-destructive-foreground',
                          'focus:bg-destructive focus:text-destructive-foreground',)}
                                          onClick={(e: MouseEvent<HTMLElement>) => {handleDeleteItemModal(e, subItem.key, 'llmChat');}} >
                          <Trash2 />削除する
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuItem>
              ))}
              <Button variant   = 'ghost'
                      className = 'mt-3 text-xs text-foreground/60'
                      disabled  = {isSending}
                      onClick   = {handleLoadMoreItems}>
                {isSending ? <Loader2 className='animate-spin' /> : 'もっと見る'}
              </Button>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
};
// LlmChat △