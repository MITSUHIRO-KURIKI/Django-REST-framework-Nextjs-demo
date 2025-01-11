/**
 * [ Context 受け取り ]
 * const context = useContext(SidebarContext);
 * const {
 *   sidebarInsetTitle,
 *   setSidebarInsetTitle,
 *   sidebarInsetSubTitle,
 *   setSidebarInsetSubTitle,
 * } = context as SidebarContextValue;
 */
'use client';

// react
import {
  createContext,
  useState,
  type ReactNode,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/components/ui/shadcn/breadcrumb';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/app/components/ui/shadcn/sidebar';
import { Separator } from '@/app/components/ui/shadcn/separator';
// import
import { Sidebar, type LoadItemDataProps } from '@/app/components/ui/Navigation';

// type
type SidebarContentWrapperProps = {
  pageSize?: number;
  children:  ReactNode,
} & LoadItemDataProps;
export type SidebarContextValue = {
  sidebarInsetTitle:       string;
  setSidebarInsetTitle:    Dispatch<SetStateAction<string>>;
  sidebarInsetSubTitle:    string;
  setSidebarInsetSubTitle: Dispatch<SetStateAction<string>>;
};


// SidebarContextProvider ▽
export function SidebarContextProvider({vrmChatInitial, pageSize, children}: SidebarContentWrapperProps): ReactElement {

  const [sidebarInsetTitle, setSidebarInsetTitle] = useState<string>('')
  const [sidebarInsetSubTitle, setSidebarInsetSubTitle] = useState<string>('')

  const contextValue: SidebarContextValue = {
    sidebarInsetTitle,
    setSidebarInsetTitle,
    sidebarInsetSubTitle,
    setSidebarInsetSubTitle,
  };

  return (
    <SidebarProvider className='min-h-[calc(100svh_-_var(--navbar-height))]'>

      <Sidebar vrmChatInitial = {vrmChatInitial}
               pageSize       = {pageSize}
               variant        = 'inset'
               collapsible    = 'offcanvas'
               className      = {cn(
               'invisible-scrollbar',
               'hidden md:flex',)} />

      <SidebarInset className={cn(
        'w-full overflow-auto',
        'max-h-[calc(100svh_-_var(--navbar-height))] min-h-[calc(100svh_-_var(--navbar-height))]',
        'peer-data-[variant=inset]:min-h-[calc(100svh_-_var(--navbar-height))]',
        'md:peer-data-[variant=inset]:rounded-l-xg md:peer-data-[variant=inset]:rounded-r-none',
        'md:peer-data-[variant=inset]:m-0',)}>
        <header className={cn(
          'sticky top-0 h-12 z-sticky',
          'flex shrink-0 items-center',
          'bg-background/30 dark:bg-background/30',
          'backdrop-blur-sm backdrop-filter',
          'gap-2 border-b',)}>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1 hidden md:block' />
            <Separator orientation='vertical' className='mr-2 hidden h-4 md:block' />
            <Breadcrumb>
              <BreadcrumbList>
                { sidebarInsetSubTitle &&
                  <>
                    <BreadcrumbItem className='hidden md:block'>
                      <BreadcrumbLink href="#">
                        {sidebarInsetSubTitle}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className='hidden md:block' />
                  </>
                }
                { sidebarInsetTitle &&
                  <BreadcrumbItem>
                    <BreadcrumbPage>{sidebarInsetTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                }
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className={cn(
          'relative x-full h-full',
          'whitespace-normal break-all',
          'px-4 pt-3 pb-8',)}>
            <SidebarContext.Provider value={contextValue}>
              { children }
            </SidebarContext.Provider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
};
// SidebarContextProvider

// SidebarContext
export const SidebarContext = createContext<SidebarContextValue | null>(null);