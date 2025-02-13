'use client';

// react
import {
  useState,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/shadcn/dialog';
import {
  SidebarInset,
  SidebarProvider,
} from '@/app/components/ui/shadcn/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/app/components/ui/shadcn/breadcrumb';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/app/components/ui/shadcn/sidebar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/app/components/ui/shadcn/select';
// include
import { ProfilePage } from '@/app/(pages)/(authenticated)/accounts/profile/main';
import { ReceptionSettingPage } from '@/app/(pages)/(authenticated)/accounts/reception_setting/main';
import { PasswordChangePage } from '@/app/(pages)/(authenticated)/accounts/password_change/main';
import { AccountDeletePage } from '@/app/(pages)/(authenticated)/accounts/delete/main';
// type
import { AccountSettingsPage } from './type.d';


// type
type AccountSettingsModalProps = {
  open:         boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

// AccountSettingsModal
export function AccountSettingsModal({ open, onOpenChange }: AccountSettingsModalProps): ReactElement {

  const [currentPage, setCurrentPage] = useState<AccountSettingsPage>('profile');

  const getPageLabel = (page: AccountSettingsPage) => {
    switch (page) {
      case 'profile':
        return 'プロフィール編集';
      case 'reception_setting':
        return 'メール受信設定';
      case 'password_change':
        return 'パスワード変更';
      case 'delete':
        return 'アカウント削除';
      default:
        return 'プロフィール編集';
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
          // 'size-[100%] max-h-[90%] max-w-full',
          'size-[100%] sm:size-[95%] md:size-[90%] lg:w-[85%] max-h-full max-w-full',
          'px-0 pt-3 md:px-0 md:pt-7',
          'bg-background md:bg-sidebar',
        )}>
        <DialogHeader>
          <DialogTitle className='sr-only'>
            アカウント設定
          </DialogTitle>
          <DialogDescription className='sr-only'>
            アカウントの設定を変更します
          </DialogDescription>
        </DialogHeader>

        <SidebarProvider className='min-h-full'>
          <Sidebar variant     = 'inset'
                   collapsible = 'offcanvas'
                   className   = {cn(
                    'invisible-scrollbar',
                    'hidden md:flex',)} >
            <SidebarHeader>
              アカウント設定
            </SidebarHeader>
            <SidebarContent className='gap-0'>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton className = {cn(
                                            currentPage === 'profile'
                                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                              : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                          )}
                                          onClick = {() => setCurrentPage('profile')}>
                          プロフィール編集
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className = {cn(
                                            currentPage === 'reception_setting'
                                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                              : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                          )}
                                          onClick = {() => setCurrentPage('reception_setting')}>
                          メール受信設定
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className = {cn(
                                              currentPage === 'password_change'
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                            )}
                                            onClick = {() => setCurrentPage('password_change')}>
                            パスワード変更
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className = {cn(
                                              currentPage === 'delete'
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                            )}
                                            onClick = {() => setCurrentPage('delete')}>
                            アカウント削除
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className={cn(
            'w-full min-h-[100%] peer-data-[variant=inset]:min-h-[100%] overflow-auto',
            'md:peer-data-[variant=inset]:rounded-l-xg md:peer-data-[variant=inset]:rounded-r-none',
            'md:peer-data-[variant=inset]:m-0',)}>

            <header className={cn(
              'sticky top-0 h-12 z-sticky',
              'flex shrink-0 items-center',
              'bg-background/30 dark:bg-background/30',
              'backdrop-blur-sm backdrop-filter',
              'rounded-tl-xl',
              'gap-2 border-b',)}>
              {/* デスクトップ用 */}
              <div className='hidden items-center gap-2 px-4 md:flex'>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {getPageLabel(currentPage)}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              {/* モバイル用 */}
              <div className='flex md:hidden'>
                <Select value         = {currentPage}
                        onValueChange = {(value) => {setCurrentPage(value as AccountSettingsPage);}}>
                  <SelectTrigger className='flex items-center space-x-2 border-0'>
                    <SelectValue placeholder='アカウント設定' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='profile'>プロフィール編集</SelectItem>
                    <SelectItem value='reception_setting'>メール受信設定</SelectItem>
                    <SelectItem value='password_change'>パスワード変更</SelectItem>
                    <SelectItem value='delete'>アカウント削除</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </header>

            <div className={cn(
              'x-full h-full',
              'whitespace-normal break-all',)}>
              <div className='px-4 pb-8 pt-3'>
                {currentPage === 'profile'           && <ProfilePage />}
                {currentPage === 'reception_setting' && <ReceptionSettingPage />}
                {currentPage === 'password_change'   && <PasswordChangePage />}
                {currentPage === 'delete'            && <AccountDeletePage />}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
};