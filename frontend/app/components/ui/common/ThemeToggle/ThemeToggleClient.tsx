'use client';

// react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import { Moon, Sun } from 'lucide-react';
// lib
import { useTheme } from 'next-themes';

// ThemeToggleClient
export function ThemeToggleClient(): ReactElement {
  const { theme, setTheme } = useTheme();
  const handleClick = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  return (
    <Button variant   = 'ghost'
            size      = 'icon'
            className = 'rounded-full'
            onClick   = {handleClick}>
      <Sun className={cn(
        'size-6 transition-all',
        'scale-100 dark:scale-0')} />
      <Moon className={cn(
        'absolute size-6 transition-all',
        'scale-0 dark:scale-100')} />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
};