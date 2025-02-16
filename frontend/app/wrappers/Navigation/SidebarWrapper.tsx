 // react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
// features
import { getRoomSettingsRoomNameList as getLlmChatRoomSettingsRoomNameList } from '@/features/api/llmchat';
import { getRoomSettingsRoomNameList as getVrmChatRoomSettingsRoomNameList } from '@/features/api/vrmchat';
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
  const [llmChatInitial, vrmChatInitial] = await Promise.all([
    getLlmChatRoomSettingsRoomNameList(1, pageSize),
    getVrmChatRoomSettingsRoomNameList(1, pageSize),
  ]);

  return (
    <>
      <Navbar isUseSidebar   = {isUseSidebar}
              llmChatInitial = {llmChatInitial?.data}
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
        <SidebarContextProvider llmChatInitial = {llmChatInitial?.data}
                                vrmChatInitial = {vrmChatInitial?.data}
                                pageSize       = {pageSize}>
          {children}
        </SidebarContextProvider>
      </div>
    </>
  );
};