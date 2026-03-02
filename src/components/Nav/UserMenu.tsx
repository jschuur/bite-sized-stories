import { BarChart3, LogIn, LogOut, Menu, Settings, ShieldUser, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

import { authClient } from '@/lib/authClient';

export default function UserMenu() {
  const [usageOpen, setUsageOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  useHotkeys('ctrl+d', () => setUsageOpen(true));

  const handleSignIn = () => {
    authClient.signIn.social({ provider: 'google', callbackURL: pathname });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  };

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
          {isPending ? (
            <DropdownMenuItem disabled className='gap-2 opacity-70'>
              <User className='h-4 w-4' />
              Loading...
            </DropdownMenuItem>
          ) : session?.user ? (
            <>
              <DropdownMenuItem disabled className='gap-2 opacity-70'>
                {session.user.isAdmin ? (
                  <ShieldUser className='h-4 w-4' />
                ) : (
                  <User className='h-4 w-4' />
                )}
                {session.user.name}
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem className='gap-2' onSelect={handleSignIn}>
                <LogIn className='h-4 w-4' />
                Sign in with Google
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem className='gap-2' onSelect={() => setUsageOpen(true)}>
            <BarChart3 className='h-4 w-4' />
            LLM Usage
          </DropdownMenuItem>

          {session?.user?.isAdmin && (
            <DropdownMenuItem className='gap-2' asChild>
              <Link href='/admin'>
                <Settings className='h-4 w-4' />
                Admin
              </Link>
            </DropdownMenuItem>
          )}

          {session?.user && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='gap-2' onSelect={handleSignOut}>
                <LogOut className='h-4 w-4' />
                Sign Out
              </DropdownMenuItem>
            </>
          )}
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
