'use client';

// next-auth
import { useSession } from 'next-auth/react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { logout } from '@/features/api/token';
import { UrlToString } from '@/features/utils';
// icons
import {
  Settings,
  LogOut,
  UserPlus,
  LogIn,
  type LucideIcon,
} from 'lucide-react';

// type
type AccountMenuItemsList = {
  key:      'loading' | 'divided' | string;
  label?:   string;
  type?:    'link' | 'action';
  href?:    string;
  icon?:    LucideIcon;
  onClick?: () => void;
};

// AccountMenuItems ▽
export function AccountMenuItems(): AccountMenuItemsList[] {
  const { status } = useSession();

  switch (status) {
    case 'loading':
      return [{
        key: 'loading',
      },];
    case 'authenticated':
      return [{
        key:   'settings',
        label: '設定',
        type:  'link',
        href:  '/',
        icon:  Settings,
      },{
        key:     'logout',
        label:   'ログアウト',
        type:    'action',
        icon:    LogOut,
        onClick: () => logout(),
      },];
    case 'unauthenticated':
    default:
      return [{
        key:   'signup',
        label: '新規登録',
        type:  'link',
        href:  UrlToString(pagesPath.authPath.signup.$url()),
        icon:  UserPlus,
      }, {
        key:   'login',
        label: 'ログイン',
        type:  'link',
        href:  UrlToString(pagesPath.authPath.login.$url()),
        icon:  LogIn,
      },];
  };
};
// AccountMenuItems △