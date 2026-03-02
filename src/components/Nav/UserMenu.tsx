import { BarChart3, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { UsageStats } from '@/components/UsageStats';

export default function UserMenu() {
  const [usageOpen, setUsageOpen] = useState(false);
  useHotkeys('ctrl+d', () => setUsageOpen(true));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className='ml-2 rounded-md p-2 transition-colors hover:bg-white/10'
            aria-label='Open menu'
          >
            <Menu className='h-5 w-5' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem disabled className='gap-2 opacity-70'>
            <User className='h-4 w-4' />
            Guest
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='gap-2' onSelect={() => setUsageOpen(true)}>
            <BarChart3 className='h-4 w-4' />
            LLM Usage
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={usageOpen} onOpenChange={setUsageOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>LLM Usage</DialogTitle>
          </DialogHeader>
          <UsageStats />
        </DialogContent>
      </Dialog>
    </>
  );
}
