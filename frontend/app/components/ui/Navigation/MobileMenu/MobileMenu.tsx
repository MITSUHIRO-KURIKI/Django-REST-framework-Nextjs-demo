// https://github.com/shadcn-ui/ui/discussions/1790#discussioncomment-7348150
'use client';

// next
import Link from 'next/link';
// react
import {
  useState,
  useEffect,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
} from 'react';
// shadcn/ui
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/app/components/ui/shadcn/sheet';
// icons
import {
  Menu,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
// components
import { Loader } from '@/app/components/ui/common';
import { OverlaySpinner } from '@/app/components/utils';
// include
import { AccountMenuItems, NavigationItems } from '../data';


// type
type MobileMenuProps = {
  setIsNavVisible: Dispatch<SetStateAction<boolean>>;
};
type SubCategoryListProps = {
  activeKey:            string | null;
  setIsMobileMenuOpen:  Dispatch<SetStateAction<boolean>>;
  setIsSubCategoryOpen: Dispatch<SetStateAction<boolean>>;
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

  // contentScale
  useEffect(() => {
    const wrapContent        = document.getElementById('navbarWrapContent');
    const contentScale       = 0.9;
    const contentScaleOffset = 60; // px
    if (!wrapContent) return;
    if (isMobileMenuOpen) {
      setIsNavVisible(false);
      wrapContent.style.setProperty('--contentScale', `${contentScale}`);
      wrapContent.style.setProperty('--offsetYValue', `${window.scrollY * (1 - contentScale) - contentScaleOffset}px`);
      wrapContent.classList.add(
        'scale-[var(--contentScale)]',
        'translate-y-[var(--offsetYValue)]',
      );
    } else {
      setIsNavVisible(true);
      wrapContent.classList.remove(
        'scale-[var(--contentScale)]',
        'translate-y-[var(--offsetYValue)]',
      );
    };
  }, [isMobileMenuOpen, setIsNavVisible]);

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      {/* SheetTrigger */}
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Menu className='size-6' />
          <span className='sr-only'>Toggle menu</span>
        </Button>
      </SheetTrigger>

      {/* SheetContent */}
      <SheetContent side='bottom'
                    className={cn(
                      'h-[60svh] overflow-y-auto rounded-t-golden-phi',
                      'bg-sidebar invisible-scrollbar',
                      'pt-8 pb-8 pr-0 pl-8',)}>

        {/* OverlaySpinner */}
        <OverlaySpinner isActivate={overlayActive} />

        <SheetTitle className='sr-only'>
          Mobile Navigation Menu
        </SheetTitle>
        <SheetDescription className='sr-only'>
          Navigation menu for mobile display
        </SheetDescription>
        <div className='absolute left-1/2 top-0 mt-4 h-px w-8 -translate-x-1/2 rounded-full bg-border' />
        <div className='relative size-full overflow-x-hidden'>
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
                        {item.icon && <item.icon className='size-4'/>}
                        <span>{item.label}</span>
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
              <Button variant ='ghost'
                      size    = 'xs'
                      className = {cn(
                        'justify-start rounded',
                        'text-xs text-foreground/60',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        '[&>svg]:text-foreground/60 hover:[&>svg]:text-sidebar-accent-foreground',)}
                      onClick = {handleGoBack}>
                <ChevronLeft className='size-4' />
                <span>back</span>
              </Button>
              <div className='space-y-4 pt-4'>
                <SubCategoryList activeKey            = {activeCategory}
                                 setIsMobileMenuOpen  = {setIsMobileMenuOpen}
                                 setIsSubCategoryOpen = {setIsSubCategoryOpen} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
// MobileMenu △

// SubCategoryList ▽
function SubCategoryList({ activeKey, setIsMobileMenuOpen, setIsSubCategoryOpen }: SubCategoryListProps): ReactElement {
  if (!activeKey) setIsSubCategoryOpen(false);
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