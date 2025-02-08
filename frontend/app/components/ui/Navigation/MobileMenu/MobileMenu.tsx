// https://github.com/shadcn-ui/ui/discussions/1790#discussioncomment-7348150
'use client';

// next
import Link from 'next/link';
// react
import {
  useState,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
} from 'react';
// shadcn/ui
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import {
  Menu,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
// components
import { Loader } from '@/app/components/ui/common';
// include
import { MobileMenuBase } from './MobileMenuBase';
import { AccountMenuItems, NavigationItems } from '../data';

// type
type MobileMenuProps = {
  setIsNavVisible: Dispatch<SetStateAction<boolean>>;
};
type SubCategoryListProps = {
  activeKey:            string | null;
  setIsMobileMenuOpen:  Dispatch<SetStateAction<boolean>>;
};

// MobileMenu ▽
export function MobileMenu({ setIsNavVisible }: MobileMenuProps): ReactElement {

  // accountMenu
  const accountMenuItems = AccountMenuItems();
  // モバイルメニュー
  const [activeCategory, setActiveCategory]       = useState<string | null>(null); // null = 大項目一覧表示,
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen]   = useState<boolean>(false);
  const [overlayActive, setOverlayActive]         = useState<boolean>(false);

  // handleCategoryClick
  const handleCategoryClick = (e: MouseEvent<HTMLElement>, categoryKey: string,): void => {
    e.preventDefault();
    e.stopPropagation();
    setActiveCategory(categoryKey);
    setIsSubCategoryOpen(true);
  };
  // handleGoBack
  const handleGoBack = (): void => {
    setIsSubCategoryOpen(false);
  };

  return (
    <>
      <Button variant   = 'ghost'
              size      = 'icon'
              className = 'md:hidden'
              onClick   = {() => setIsMobileMenuOpen(true)}>
        <Menu className='size-6' />
        <span className='sr-only'>Toggle menu</span>
      </Button>

      <MobileMenuBase isMobileMenuOpen    = {isMobileMenuOpen}
                      setIsMobileMenuOpen = {setIsMobileMenuOpen}
                      overlayActive       = {overlayActive}
                      setIsNavVisible     = {setIsNavVisible}>

        {/* メインカテゴリ画面 */}
        <div className={cn(
          'absolute top-0 left-0 size-full transition-transform',
          'duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          !isSubCategoryOpen ? 'translate-x-0' : '-translate-x-full',)}>
          <div>
            <ul className='w-full space-y-2 pr-8'>
              {/* サイドバーなし */}
              { NavigationItems.Navbar.map((item) => (
                <li key={item.key} className='w-full'>
                  {item.sub && item.sub.length > 0 ? (
                    // include SubCategories
                    <Button variant   = 'link'
                            size      = 'fit'
                            className = {cn(
                              'w-full h-8 justify-start rounded',
                              'text-sm font-normal text-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                            onClick={(e) => handleCategoryClick(e, item.key)}>
                      {item.icon && <item.icon className='size-4'/>}{item.label}
                      <ChevronRight className='size-4 text-foreground' />
                    </Button>
                  ) : (
                    // No SubCategorie
                    <Link href      = {item.href ?? '#'}
                          className = {cn(
                            'gap-2 flex w-full h-8 justify-start items-center rounded',
                            'text-sm font-normal text-foreground [&>svg]:text-sidebar-accent-foreground',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                          onClick={() => setIsMobileMenuOpen(false)} >
                      {item.icon && <item.icon className='size-4' />}{item.label}
                    </Link>
                  )}
                </li>
              ))}
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
          <Button variant   ='ghost'
                  size      = 'xs'
                  className = {cn(
                    'justify-start rounded',
                    'text-xs text-foreground/60',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    '[&>svg]:text-foreground/60 hover:[&>svg]:text-sidebar-accent-foreground',)}
                  onClick = {handleGoBack} >
            <ChevronLeft className='size-4' />back
          </Button>
          <div className='space-y-4 pt-4'>
            <SubCategoryList activeKey           = {activeCategory}
                             setIsMobileMenuOpen = {setIsMobileMenuOpen} />
          </div>
        </div>
      </MobileMenuBase>
    </>
  );
};
// MobileMenu △

// SubCategoryList ▽
function SubCategoryList({ activeKey, setIsMobileMenuOpen }: SubCategoryListProps): ReactElement {

  if (!activeKey) return <></>;

  const item = NavigationItems.Navbar.find((cat) => cat.key === activeKey);

  return (
    <div>
      <div className={cn(
        'flex gap-2 mb-2 justify-start items-center',
        'text-xs font-light text-foreground',
        '[&>svg]:text-foreground',)}>
        {item?.label}
      </div>
      <ul className='ml-2 w-full space-y-2 pr-8'>
        {item?.sub?.map((subItem) => (
          <li key={subItem.key}>
            <div className='flex w-full items-center justify-between'>
              <Link href      = {subItem.href}
                    className = {cn(
                      'flex w-full h-8 justify-start items-center rounded',
                      'text-sm font-normal text-foreground',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',)}
                    onClick={() => setIsMobileMenuOpen(false)} >
                {subItem.label}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
// SubCategoryList △