'use client';

// react
import { useEffect, useContext, type ReactElement } from 'react';
// providers
import {
  SidebarContext,
  type SidebarContextValue,
} from '@/app/providers';
// hooks
import { useRedirectErrorMessage } from '@/app/hooks/';


export function DashBoardContent(): ReactElement {

  // Sidebar タイトルセット ▽
  const sbarContext = useContext(SidebarContext);
  const {
    setSidebarInsetTitle,
  } = sbarContext as SidebarContextValue;
  useEffect(() => {
    setSidebarInsetTitle('DashBoard');
  }, [setSidebarInsetTitle]);
  // Sidebar タイトルセット △

  // リダイレクト時メッセージ処理
  useRedirectErrorMessage();

  return (
    <>
    <p>ダッシュボード</p>
    </>
  )
};