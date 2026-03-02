'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Coins, Globe, Users } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';

import ActivityChart from '@/components/Admin/ActivityChart';
import StatCard from '@/components/Admin/StatCard';
import UsersTable from '@/components/Admin/UsersTable';

import { supportedLanguages } from '@/config';

import { DashboardStats } from '@/types';

export default function AdminPage() {
  const [days, setDays] = useQueryState('days', parseAsString.withDefault('30'));
  const [chartTab, setChartTab] = useQueryState('chart', parseAsString.withDefault('stories'));

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-stats', days],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (days) params.set('days', days);

      const res = await fetch(`/api/admin/stats?${params}`);
      if (!res.ok) throw new Error('Failed to fetch stats');

      return res.json();
    },
  });

  return (
    <div className='py-12 px-4'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground mt-1'>Overview of your story generation platform.</p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            title='Stories'
            value={data?.cards.stories}
            icon={<BookOpen className='size-4 text-muted-foreground' />}
            isLoading={isLoading}
          />
          <StatCard
            title='Languages'
            value={data?.cards.languages}
            icon={<Globe className='size-4 text-muted-foreground' />}
            description={`Languages used of ${supportedLanguages.length} supported`}
            isLoading={isLoading}
          />
          <StatCard
            title='Users'
            value={data?.cards.users}
            icon={<Users className='size-4 text-muted-foreground' />}
            description={
              data
                ? `Including ${data.users.filter((u) => u.isAdmin).length} ${data.users.filter((u) => u.isAdmin).length === 1 ? 'admin' : 'admins'}`
                : 'Registered accounts'
            }
            isLoading={isLoading}
          />
          <StatCard
            title='Token Usage'
            value={data?.cards.totalTokens}
            icon={<Coins className='size-4 text-muted-foreground' />}
            description='Total tokens consumed'
            isLoading={isLoading}
          />
        </div>

        <ActivityChart
          data={data}
          days={days}
          setDays={setDays}
          chartTab={chartTab}
          setChartTab={setChartTab}
          isLoading={isLoading}
        />

        <UsersTable users={data?.users} isLoading={isLoading} />
      </div>
    </div>
  );
}
