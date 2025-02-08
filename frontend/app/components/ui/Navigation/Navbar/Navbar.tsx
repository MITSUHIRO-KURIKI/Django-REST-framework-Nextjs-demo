'use client';

// next
import Link from 'next/link';
// react
import { useState, useEffect, type ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
// components
import { ThemeToggle } from '@/app/components/ui/common';
// include
import { NavigationMenu } from './NavigationMenu';
import { AccountIconMenu } from './AccountIconMenu';
import { MobileMenu, MobileMenuSidever } from '../MobileMenu';
import { LoadItemDataProps } from '../data';

// type
type NavbarProps = {
  isUseSidebar?:  boolean;
  pageSize?:      number;
  navbarBgColor?: string;
} & LoadItemDataProps;


// Navbar ▽
export function Navbar({isUseSidebar, vrmChatInitial, pageSize, navbarBgColor}: NavbarProps): ReactElement {
  const [isNavVisible, setIsNavVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY]   = useState<number>(0);

  // スクロールで表示・非表示用
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={cn(
      'fixed z-fixed top-0 left-0 w-full h-[var(--navbar-height)]',
      'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
      'backdrop-blur-sm backdrop-filter',
      navbarBgColor ? navbarBgColor : 'bg-background/30 dark:bg-background/30',
      !isUseSidebar && 'border-b border-border',
      isNavVisible ? 'translate-y-0' : '-translate-y-full',)}>
      <div className='flex h-[var(--navbar-height)] w-full items-center'>

        {/* Logo */}
        <div className={cn(
          'flex-1 justify-start pl-2',
          'md:flex-1 md:pl-8',)}>
          <Link href={pagesPath.$url()} className='font-bold'>
            {process.env.NEXT_PUBLIC_SITE_NAME as string}
          </Link>
        </div>

        {/* NavigationMenu */}
        { !isUseSidebar && (
          <div className={cn(
            'flex-none invisible max-w-0 hidden flex items-center justify-center',
            'md:visible')}>
            <NavigationMenu />
          </div>
        )}

        {/* Right Button */}
        <div className={cn(
          'flex-2 flex justify-end pr-2',
          'md:flex-1 md:pr-8')}>
          {/* ThemeToggle */}
          <ThemeToggle />

          {/* AccountIconMenu */}
          <div className={cn(
            'hidden',
            'md:block')}>
            <AccountIconMenu />
          </div>

          {/* MobileMenu */}
          { !isUseSidebar ? (
            <MobileMenu setIsNavVisible = {setIsNavVisible}/>
          ) : (
            <MobileMenuSidever setIsNavVisible = {setIsNavVisible}
                               vrmChatInitial  = {vrmChatInitial}
                               pageSize        = {pageSize} />
          )}
        </div>
      </div>
    </nav>
  );
};
// Navbar △