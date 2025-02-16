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
import { Button } from '@/app/components/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/shadcn/dropdown-menu';
// icons
import {
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
// features
import { UrlToString } from '@/features/utils';
// type
import type { SubCategoryPageProps } from '../MobileMenuSidever';


// VrmChat ▽
export function VrmChat({
  setIsMobileMenuOpen,
  isSending,
  items,
  handleLoadMoreItems,
  handleCreateItem,
  handleItemNameEditModal,
  handleDeleteItemModal, }: SubCategoryPageProps): ReactElement {

  return (
  <>
    <div className={cn(
      'flex gap-2 mb-2 justify-start items-center',
      'text-xs font-light text-foreground select-none',
      '[&>svg]:text-foreground',)}>
      VRM Chat
    </div>
    <Button size      = 'sm'
            className = 'absolute right-4 top-4 text-xs'
            disabled  = {isSending}
            onClick   = {handleCreateItem}>
      {isSending ? <Loader2 className='animate-spin' /> : '新しい会話を始める'}
    </Button>
    <ul className='ml-2 w-full space-y-2 pr-8'>
      { items.map((subItem) => (
        <li key={subItem.key}>
          <div className='flex w-full items-center justify-between'>
            <Link href      = {UrlToString(pagesPath.servicesPath.vrmChatRoom.$url({_roomId:subItem.href}))}
                  className = {cn(
                    'flex w-full h-8 justify-start items-center rounded',
                    'text-sm font-normal text-foreground select-none',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',)}
                  onClick={() => setIsMobileMenuOpen(false)} >
              {subItem.label}
            </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick = {(e: MouseEvent<HTMLElement>,) => {handleItemNameEditModal(e, subItem.key, subItem.label);}} >
                    <Pencil />タイトル変更
                  </DropdownMenuItem>
                  <DropdownMenuItem className = {cn(
                    'text-destructive',
                    'hover:bg-destructive hover:text-destructive-foreground',
                    'focus:bg-destructive focus:text-destructive-foreground',)}
                                    onClick = {(e: MouseEvent<HTMLElement>,) => {handleDeleteItemModal(e, subItem.key);}} >
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
            disabled  = {isSending}
            onClick   = {handleLoadMoreItems}>
            {isSending ? <Loader2 className='animate-spin' /> : 'もっと見る'}
    </Button>
  </>
  );
};
// VrmChat △