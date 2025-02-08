 // react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { getRoomSettingsRoomNameList } from '@/features/api/vrmchat';
// components
import { Navbar } from '@/app/components/ui/Navigation';
// import
import { SidebarContextProvider } from '@/app/providers';
import { NavigationWrapperProps } from './type.d';

// SidebarWrapper
export async function SidebarWrapper({ wrapName, className, children }: NavigationWrapperProps): Promise<ReactElement> {
  const isUseSidebar  = true;
  const navbarBgColor = 'bg-sidebar';
  const pageSize      = 3;

  // InitData (サーバ取得)
  const [vrmChatInitial] = await Promise.all([
    getRoomSettingsRoomNameList(1, pageSize),
  ]);
  // 複数取る場合は以下
  // const [initial1, initial2] = await Promise.all([
  //   get1(1, 3), get2(1, 3),
  // ]);

  return (
    <>
      <Navbar isUseSidebar   = {isUseSidebar}
              vrmChatInitial = {vrmChatInitial?.data}
              pageSize       = {pageSize}
              navbarBgColor  = {navbarBgColor} />
      <div id={ wrapName ?? 'navbarWrapContent'}
           className={cn(
            'origin-top',
            'absolute top-[var(--navbar-height)] w-full h-[calc(100svh_-_var(--navbar-height))] min-h-[calc(100svh_-_var(--navbar-height))]',
            'transform transition-transform',
            'duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            className,)}>
        <SidebarContextProvider vrmChatInitial = {vrmChatInitial?.data}
                                pageSize       = {pageSize}>
          {children}
        </SidebarContextProvider>
      </div>
    </>
  );
};