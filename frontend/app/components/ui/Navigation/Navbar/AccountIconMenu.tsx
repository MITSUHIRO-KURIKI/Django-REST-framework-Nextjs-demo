// next
import Link from 'next/link';
// react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import { DropdownMenu,
         DropdownMenuContent,
         DropdownMenuItem,
         DropdownMenuTrigger,
} from '@/app/components/ui/shadcn/dropdown-menu';
// icons
import { User } from 'lucide-react';
// components
import { Loader } from '@/app/components/ui/common';
// include
import { AccountMenuItems } from '../data';


// AccountIconMenu ▽
export function AccountIconMenu(): ReactElement {
  const items = AccountMenuItems();

  return (
    <DropdownMenu>

      {/* DropdownMenuTrigger */}
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='rounded-full'>
          <User className='size-6' />
          <span className='sr-only'>User menu</span>
        </Button>
      </DropdownMenuTrigger>

      {/* DropdownMenuContent */}
      <DropdownMenuContent align='end' className='mt-2 w-64 bg-sidebar px-0 py-2'>
        {items.map((item) => {
          if (item.key === 'loading') {
            return <div key={item.key}><Loader /></div>;
          } else if (item.key === 'divided') {
            return <div key={item.key} className={cn('my-2','h-[1px] w-full rounded-full bg-border',)} />;
          } else {
            return (
              <DropdownMenuItem key={item.key} asChild>
                {item.type === 'action' && item.onClick ? (
                  <Button variant   = 'ghost'
                          key       = {item.key}
                          onClick   = {item.onClick}
                          className = {cn(
                            'w-full h-8 px-4 justify-start rounded-none',
                            'text-xs font-light text-foreground',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',
                            'focus-visible:ring-0',
                            'cursor-pointer',)}>
                    {item.icon && <item.icon className='size-4' />}{item.label}
                  </Button>
                ) : (
                  <Link key       = {item.key}
                        href      = {item.href ?? '#'}
                        className = {cn(
                          'w-full h-8 px-4 rounded-none',
                          'text-xs font-light text-foreground text-left',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',
                          'cursor-pointer',)}>
                    {item.icon && <item.icon className='size-4' />}{item.label}
                  </Link>
                )}
              </DropdownMenuItem>
            );
          };
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
// AccountIconMenu △