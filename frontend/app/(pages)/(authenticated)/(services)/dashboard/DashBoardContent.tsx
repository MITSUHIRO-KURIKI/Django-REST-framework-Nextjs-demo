'use client';

// react
import { useEffect, useContext, type ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// providers
import { SidebarContext } from '@/app/components/ui/Navigation';
// hooks
import { useRedirectErrorMessage } from '@/app/hooks/';
// features
import { UrlToString } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';


// DashBoardContent
export function DashBoardContent(): ReactElement {


  // sidebarContext first ▽
  const sidebarContext = useContext(SidebarContext);
  const {
    setSidebarInsetTitle,
    setSidebarInsetSubTitle,
    setSidebarInsetSubTitleUrl,
  } = sidebarContext || {};
  // sidebarContext first △

  // Sidebar タイトルセット ▽
  useEffect(() => {
    if (setSidebarInsetTitle)       setSidebarInsetTitle('DashBoard');
    if (setSidebarInsetSubTitle)    setSidebarInsetSubTitle('');
    if (setSidebarInsetSubTitleUrl) setSidebarInsetSubTitleUrl(UrlToString(pagesPath.servicesPath.dashBoard.$url()));
  }, [setSidebarInsetTitle, setSidebarInsetSubTitle, setSidebarInsetSubTitleUrl]);
  // Sidebar タイトルセット △

  // リダイレクト時メッセージ処理
  useRedirectErrorMessage();

  // sidebarContext last ▽
  if (!sidebarContext) {
    showToast('error', 'error', { position: 'bottom-right', duration: 3000 });
    return <p className='select-none text-xs font-thin text-muted-foreground'>Sorry, not available</p>;
  };
  // sidebarContext last △
  return (
    <>
    <p>ダッシュボード</p>
    </>
  )
};