// https://github.com/shadcn-ui/ui/discussions/1790#discussioncomment-7348150
'use client';


// react
import {
  useEffect,
  type ReactElement,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
// shadcn/ui
import { cn } from '@/app/components/lib/shadcn';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/app/components/ui/shadcn/sheet';
// components
import { OverlaySpinner } from '@/app/components/utils';

type MobileMenuBaseProps = {
  isMobileMenuOpen:    boolean;                             // メニューが開いているか
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  overlayActive:       boolean;                             // オーバーレイ表示するか
  setIsNavVisible:     Dispatch<SetStateAction<boolean>>;   // コンテンツのスケールエフェクト
  side?:               'bottom' | 'top' | 'left' | 'right'; // Sheetの表示位置
  className?:          string;
  children?:           ReactNode;
};

/**
 * MobileMenuBase:
 *   - Sheet(open={...} onOpenChange={...}) 周りの共通処理
 *   - OverlaySpinner, contentScaleエフェクトなど
 *   - 親コンポーネント( MobileMenu / MobileMenuSidever ) で states を管理し
 *     ここには props と children を注入して使う
 */
export function MobileMenuBase({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  overlayActive,
  setIsNavVisible,
  side = 'bottom',
  className,
  children, }: MobileMenuBaseProps): ReactElement {

  // contentScale
  //  - モバイルメニュー起動時の画面のスケールエフェクト
  useEffect(() => {
    const wrapContent = document.getElementById('navbarWrapContent');
    if (!wrapContent) return;

    const contentScale       = 0.9;
    const contentScaleOffset = 60; // px

    if (isMobileMenuOpen) {
      setIsNavVisible(false);
      wrapContent.style.setProperty('--contentScale', `${contentScale}`);
      wrapContent.style.setProperty(
        '--offsetYValue',
        `${window.scrollY * (1 - contentScale) - contentScaleOffset}px`,
      );
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
    }
  }, [isMobileMenuOpen, setIsNavVisible]);

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetContent side      = {side}
                    className = {cn(
                      'h-[60svh] overflow-y-auto rounded-t-golden-phi bg-sidebar invisible-scrollbar pt-8 pb-8 pr-0 pl-8',
                    className,)}>

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
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};