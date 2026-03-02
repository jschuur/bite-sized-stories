import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { formatNumber } from '@/utils';

export default function StatCard({
  title,
  value,
  icon,
  description = '',
  isLoading,
}: {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  description?: string;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>
          {isLoading ? (
            <div className='h-8 w-20 animate-pulse rounded bg-muted' />
          ) : (
            formatNumber(value ?? 0)
          )}
        </div>
        <p className='text-xs text-muted-foreground mt-1'>{description}</p>
      </CardContent>
    </Card>
  );
}
