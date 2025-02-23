// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { UrlToString } from '@/features/utils';
// icons
import {
  Layers,
  MessageCircleMore,
  AudioLines,
  Send,
  MessageCircleQuestion,
} from 'lucide-react';
// type
import type { Item } from './type.d';

// type
type NavigationProps = {
  Navbar:        Item[];
  SidebarFooter: Item[];
};
  
// NavigationItems ▽
export const NavigationItems: NavigationProps = {
  // Navbar
  Navbar: [
    {
      key:   'getStarted',
      label: 'Get Started',
      sub: [
        { key: 'dummy1', label: 'dummy', href: '#' },
        { key: 'dummy2', label: 'dummy', href: '#' },
        { key: 'dummy3', label: 'dummy', href: '#' },
        { key: 'dummy4', label: 'dummy', href: '#' },
        { key: 'dummy5', label: 'dummy', href: '#' },
        { key: 'dummy6', label: 'dummy', href: '#' },
      ],
    },
    {
      key:   'products',
      label: 'Products',
      sub: [
        {
          key:   'dashBoard',
          label: 'Dash Board',
          icon:  Layers,
          href:  UrlToString(pagesPath.servicesPath.dashBoard.$url()),
        },
        {
          key:   'llmChat',
          label: 'LLM Chat',
          icon:  MessageCircleMore,
          href:  UrlToString(pagesPath.servicesPath.llmChat.$url()),
        },
        {
          key:   'vrmChat',
          label: 'VRM Chat',
          icon:  AudioLines,
          href:  UrlToString(pagesPath.servicesPath.vrmChat.$url()),
        },
      ],
    },
    {
      key:   'samplePage',
      label: 'Sample Page',
      sub: [
        { key: 'colors',    label: 'Colors',     href: '/colors' },
        { key: 'scrollSpy', label: 'Scroll Spy', href: '/colors' },
      ],
    },
    {
      key:   'dummyLink',
      label: 'Dummy Link',
      href:  '#',
    },
  ],
  // SidebarFooter
  SidebarFooter: [
    {
      key:   'FAQ',
      label: 'FAQ',
      href:  '#',
      icon:  MessageCircleQuestion,
    },
    {
      key:   'Feedback',
      label: 'Feedback',
      href:  '#',
      icon:  Send,
    },
  ],
};
// NavigationItems △