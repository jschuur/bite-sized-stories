'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import UserMenu from '@/components/Nav/UserMenu';

import useUserPermissions from '@/hooks/useUserPermissions';

export function Navbar() {
  const pathname = usePathname();
  const { canCreateStory } = useUserPermissions();

  const linkClass = (href: string) => {
    const isActive =
      href === '/stories'
        ? pathname === '/stories' || pathname.startsWith('/story/')
        : pathname === href;

    return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-white/20' : 'hover:bg-white/10'
    }`;
  };

  return (
    <>
      <nav className='bg-amber-200 dark:bg-indigo-900/80 backdrop-blur-sm border-b border-amber-300 text-black'>
        <div className='mx-auto max-w-full px-4'>
          <div className='flex h-14 items-center justify-between'>
            <Link href='/' className='text-lg font-bold tracking-tight'>
              Bite Sized Stories
            </Link>
            <div className='flex items-center gap-1'>
              <Link href='/stories' className={linkClass('/stories')}>
                Stories
              </Link>
              {canCreateStory && (
                <Link href='/new' className={linkClass('/new')}>
                  New Story
                </Link>
              )}

              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
