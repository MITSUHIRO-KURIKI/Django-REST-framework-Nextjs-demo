// react
import { type ReactNode, type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
// components
import { Navbar } from '@/app/components/ui/Navigation';

// NavbarWrapper
export function NavbarWrapper({ wrapName, className, children }: { wrapName?: string, className?: string | null, children: ReactNode }): ReactElement {
  const isUseSidebar = false
  return (
    <>
      <Navbar isUseSidebar={isUseSidebar}/>
      <div id={ wrapName ?? 'navbarWrapContent'}
           className={cn(
            'origin-top',
            'absolute top-[var(--navbar-height)] w-full h-[calc(100svh_-_var(--navbar-height))] min-h-[calc(100svh_-_var(--navbar-height))]',
            'transform transition-transform',
            'duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            className,)}>
        {children}
      </div>
    </>
  );
};